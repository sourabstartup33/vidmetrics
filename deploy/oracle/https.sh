#!/usr/bin/env bash
# Free HTTPS (Let's Encrypt) for the VidMetrics server made by setup.sh.
#
# Run this INSIDE OCI Cloud Shell, after setup.sh has finished.
# Before running, point your domain at the server: in your domain's DNS
# settings add an "A" record  ->  name "@" (and optionally "www")
#                                 value = the server's public IP
#
#   bash https.sh                       # asks for the domain
#   DOMAIN=example.com EMAIL=me@example.com bash https.sh
#
# Certificates renew automatically (certbot's systemd timer).
set -euo pipefail

NAME="${NAME:-vidmetrics}"
COMP="${COMPARTMENT_OCID:-${OCI_TENANCY:-}}"
SSH_KEY="$HOME/.ssh/id_rsa"
DOMAIN="${DOMAIN:-}"
EMAIL="${EMAIL:-}"
DNS_WAIT_MIN="${DNS_WAIT_MIN:-15}"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

command -v oci >/dev/null || die "oci CLI not found. Run this in OCI Cloud Shell."
[ -n "$COMP" ] || die "No compartment. Run: export COMPARTMENT_OCID=<your tenancy OCID>"
[ -f "$SSH_KEY" ] || die "SSH key $SSH_KEY not found. Run setup.sh first, from this same Cloud Shell."

# ---------------------------------------------------------------- server IP
INST=$(oci compute instance list --compartment-id "$COMP" --display-name "$NAME" \
         --lifecycle-state RUNNING --query 'data[0].id' --raw-output 2>/dev/null || true)
[ -n "$INST" ] || die "No running instance named '$NAME'. Run setup.sh first."
IP=$(oci compute instance list-vnics --instance-id "$INST" \
       --query 'data[0]."public-ip"' --raw-output)
say "Server public IP: $IP"

# ---------------------------------------------------------------- inputs
if [ -z "$DOMAIN" ]; then
  read -rp "Your domain (e.g. vidmetrics.com or app.vidmetrics.com): " DOMAIN
fi
DOMAIN=$(printf '%s' "$DOMAIN" | tr '[:upper:]' '[:lower:]' | sed -E 's#^https?://##; s#/.*$##; s/^www\.//')
[[ "$DOMAIN" =~ ^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$ ]] || die "'$DOMAIN' doesn't look like a domain."

if [ -z "$EMAIL" ]; then
  read -rp "Email for expiry warnings from Let's Encrypt (Enter to skip): " EMAIL
fi
if [ -n "$EMAIL" ] && ! [[ "$EMAIL" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
  die "'$EMAIL' doesn't look like an email."
fi

cat <<EOF

  Make sure your DNS has this record (at your domain registrar or DNS host):

      Type: A     Name: @      Value: $IP
      Type: A     Name: www    Value: $IP      (optional)

  For a subdomain like app.example.com, use Name: app instead of @.
  Using Cloudflare? Set the record to "DNS only" (grey cloud) for this step.

EOF

# ---------------------------------------------------------------- remote
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 ubuntu@$IP"
say "Configuring HTTPS on the server"
{
printf 'DOMAIN=%q EMAIL=%q IP=%q DNS_WAIT_MIN=%q SKIP_DNS_CHECK=%q\n' \
  "$DOMAIN" "$EMAIL" "$IP" "$DNS_WAIT_MIN" "${SKIP_DNS_CHECK:-}"
cat <<'REMOTE'
set -euo pipefail

resolves_here() {  # does $1 point (only) at this server?
  local ips
  ips=$(getent ahostsv4 "$1" 2>/dev/null | awk '{print $1}' | sort -u | tr '\n' ' ')
  [ "$ips" = "$IP " ]
}

# 1. Wait for DNS
if [ -z "$SKIP_DNS_CHECK" ]; then
  echo "  waiting for $DOMAIN -> $IP (up to $DNS_WAIT_MIN min)"
  for i in $(seq 1 $((DNS_WAIT_MIN * 2))); do
    resolvectl flush-caches 2>/dev/null || true
    resolves_here "$DOMAIN" && break
    if [ "$i" -eq $((DNS_WAIT_MIN * 2)) ]; then
      now=$(getent ahostsv4 "$DOMAIN" | awk '{print $1}' | sort -u | tr '\n' ' ')
      echo "ERROR: $DOMAIN resolves to '${now:-nothing}', not $IP."
      echo "Fix the A record (or wait for DNS to update) and run https.sh again."
      echo "Behind Cloudflare's proxy on purpose? Re-run with SKIP_DNS_CHECK=1."
      exit 1
    fi
    sleep 30
  done
  echo "  DNS ok"
fi

NAMES=("$DOMAIN")
if resolves_here "www.$DOMAIN"; then NAMES+=("www.$DOMAIN"); echo "  www.$DOMAIN also points here, including it"; fi

# 2. nginx: answer to the domain (certbot needs a matching server_name)
sed -i -E "s/^(\s*server_name).*/\1 ${NAMES[*]};/" /etc/nginx/sites-available/default
nginx -t -q && systemctl reload nginx

# 3. certbot
export DEBIAN_FRONTEND=noninteractive
command -v certbot >/dev/null || { apt-get update -q; apt-get install -y -q certbot python3-certbot-nginx; }

ARGS=(--nginx --non-interactive --agree-tos --redirect --keep-until-expiring)
for n in "${NAMES[@]}"; do ARGS+=(-d "$n"); done
if [ -n "$EMAIL" ]; then ARGS+=(-m "$EMAIL"); else ARGS+=(--register-unsafely-without-email); fi
certbot "${ARGS[@]}"

# 4. auto-renew check
systemctl enable --now certbot.timer >/dev/null 2>&1 || true
certbot renew --dry-run -q && echo "  auto-renewal ok"
REMOTE
} | $SSH sudo bash -s

# ---------------------------------------------------------------- verify
say "Checking https://$DOMAIN"
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://$DOMAIN" || true)
if [[ "$code" =~ ^(200|30[1278])$ ]]; then
  say "Done! VidMetrics is live at:  https://$DOMAIN   (http redirects to https)"
else
  echo "  Certificate is installed, but https://$DOMAIN answered '$code' from Cloud Shell."
  echo "  Try it in your browser; if it fails, check: $SSH 'pm2 logs vidmetrics'"
fi
