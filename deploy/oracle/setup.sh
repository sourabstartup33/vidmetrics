#!/usr/bin/env bash
# VidMetrics on Oracle Cloud Always Free (Ampere A1, ARM).
#
# Run this INSIDE OCI Cloud Shell (the ">_" icon in the Oracle console).
# Cloud Shell is already logged in as you, so no API keys are needed.
#
# It creates (or reuses): a VCN + subnet + internet gateway, firewall rules
# for 22/80/443, and one VM.Standard.A1.Flex instance sized to the 2026
# Always Free limit (2 OCPU / 12 GB). Then it installs Node, nginx and pm2,
# builds VidMetrics and serves it on http://<public-ip>.
#
# Optional overrides:  NAME=vidmetrics OCPUS=2 MEM_GB=12 RETRY_ROUNDS=60 \
#                      COMPARTMENT_OCID=ocid1.compartment... bash setup.sh
set -euo pipefail

NAME="${NAME:-vidmetrics}"
OCPUS="${OCPUS:-2}"
MEM_GB="${MEM_GB:-12}"
RETRY_ROUNDS="${RETRY_ROUNDS:-60}"     # A1 capacity is often full; keep retrying
REPO="${REPO:-https://github.com/sourabstartup33/vidmetrics.git}"
COMP="${COMPARTMENT_OCID:-${OCI_TENANCY:-}}"
SHAPE="VM.Standard.A1.Flex"
SSH_KEY="$HOME/.ssh/id_rsa"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

command -v oci >/dev/null || die "oci CLI not found. Run this in OCI Cloud Shell."
[ -n "$COMP" ] || die "No compartment. Run: export COMPARTMENT_OCID=<your tenancy OCID>"

# oci prints "Query returned empty result" to stderr when nothing matches.
q() { oci "$@" 2>/dev/null || true; }

# ---------------------------------------------------------------- API keys
say "API keys for VidMetrics (input is hidden; press Enter to skip one)"
read -rsp "YouTube Data API v3 key: " YT_KEY; echo
read -rsp "Gemini API key: " GEMINI_KEY; echo
[ -n "$YT_KEY" ] || echo "  (no YouTube key: the app will load but cannot fetch channels)"

# ---------------------------------------------------------------- SSH key
if [ ! -f "$SSH_KEY" ]; then
  say "Creating SSH key $SSH_KEY"
  mkdir -p "$HOME/.ssh"
  ssh-keygen -t rsa -b 4096 -N "" -f "$SSH_KEY" -q
fi

# ---------------------------------------------------------------- network
say "Network"
VCN=$(q network vcn list --compartment-id "$COMP" --display-name "$NAME-vcn" \
        --lifecycle-state AVAILABLE --query 'data[0].id' --raw-output)
if [ -z "$VCN" ]; then
  VCN=$(oci network vcn create --compartment-id "$COMP" --display-name "$NAME-vcn" \
        --cidr-blocks '["10.0.0.0/16"]' --dns-label vidmetrics \
        --wait-for-state AVAILABLE --query 'data.id' --raw-output)
  echo "  created VCN"
else
  echo "  reusing VCN"
fi

IGW=$(q network internet-gateway list --compartment-id "$COMP" --vcn-id "$VCN" \
        --query 'data[0].id' --raw-output)
if [ -z "$IGW" ]; then
  IGW=$(oci network internet-gateway create --compartment-id "$COMP" --vcn-id "$VCN" \
        --is-enabled true --display-name "$NAME-igw" \
        --wait-for-state AVAILABLE --query 'data.id' --raw-output)
  echo "  created internet gateway"
fi

RT=$(oci network vcn get --vcn-id "$VCN" --query 'data."default-route-table-id"' --raw-output)
oci network route-table update --rt-id "$RT" --force \
  --route-rules "[{\"destination\":\"0.0.0.0/0\",\"destinationType\":\"CIDR_BLOCK\",\"networkEntityId\":\"$IGW\"}]" \
  >/dev/null
echo "  route 0.0.0.0/0 -> internet gateway"

SL=$(oci network vcn get --vcn-id "$VCN" --query 'data."default-security-list-id"' --raw-output)
tcp() { printf '{"source":"0.0.0.0/0","protocol":"6","isStateless":false,"tcpOptions":{"destinationPortRange":{"min":%s,"max":%s}}}' "$1" "$1"; }
INGRESS="[$(tcp 22),$(tcp 80),$(tcp 443),{\"source\":\"0.0.0.0/0\",\"protocol\":\"1\",\"isStateless\":false,\"icmpOptions\":{\"type\":3,\"code\":4}}]"
oci network security-list update --security-list-id "$SL" --force \
  --ingress-security-rules "$INGRESS" \
  --egress-security-rules '[{"destination":"0.0.0.0/0","protocol":"all","isStateless":false}]' \
  >/dev/null
echo "  firewall open: 22, 80, 443"

SUBNET=$(q network subnet list --compartment-id "$COMP" --vcn-id "$VCN" \
          --display-name "$NAME-subnet" --query 'data[0].id' --raw-output)
if [ -z "$SUBNET" ]; then
  SUBNET=$(oci network subnet create --compartment-id "$COMP" --vcn-id "$VCN" \
            --display-name "$NAME-subnet" --cidr-block 10.0.0.0/24 --dns-label web \
            --wait-for-state AVAILABLE --query 'data.id' --raw-output)
  echo "  created public subnet"
fi

# ---------------------------------------------------------------- image
say "Finding latest Ubuntu ARM image"
IMG=""
for v in "24.04" "22.04"; do
  IMG=$(q compute image list --compartment-id "$COMP" --operating-system "Canonical Ubuntu" \
          --operating-system-version "$v" --shape "$SHAPE" \
          --sort-by TIMECREATED --sort-order DESC --query 'data[0].id' --raw-output)
  [ -n "$IMG" ] && { echo "  Ubuntu $v"; break; }
done
[ -n "$IMG" ] || die "No Ubuntu image found for $SHAPE in this region."

# ---------------------------------------------------------------- cloud-init
CI_FILE=$(mktemp)
cat >"$CI_FILE" <<EOF
#!/bin/bash
set -eux
# Oracle's Ubuntu images ship an iptables REJECT rule; let web traffic in.
iptables -I INPUT 1 -p tcp --dport 80  -m conntrack --ctstate NEW -j ACCEPT
iptables -I INPUT 1 -p tcp --dport 443 -m conntrack --ctstate NEW -j ACCEPT
netfilter-persistent save || true
# Small swap so builds never OOM
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
export DEBIAN_FRONTEND=noninteractive
apt-get update
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs nginx git
npm install -g pm2
cat >/etc/nginx/sites-available/default <<'NGINX'
server {
  listen 80 default_server;
  server_name _;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }
}
NGINX
systemctl restart nginx
sudo -u ubuntu git clone $REPO /home/ubuntu/vidmetrics
EOF

# ---------------------------------------------------------------- instance
INST=$(q compute instance list --compartment-id "$COMP" --display-name "$NAME" \
         --lifecycle-state RUNNING --query 'data[0].id' --raw-output)
if [ -n "$INST" ]; then
  say "Instance '$NAME' already running, reusing it"
else
  ADS=$(oci iam availability-domain list --compartment-id "$COMP" \
          --query "join(' ', data[].name)" --raw-output)
  say "Launching $SHAPE ($OCPUS OCPU / $MEM_GB GB). Free A1 capacity is often full; I'll keep retrying."
  for round in $(seq 1 "$RETRY_ROUNDS"); do
    for AD in $ADS; do
      echo "  attempt $round, $AD ..."
      if OUT=$(oci compute instance launch --compartment-id "$COMP" \
                 --availability-domain "$AD" --shape "$SHAPE" \
                 --shape-config "{\"ocpus\":$OCPUS,\"memoryInGBs\":$MEM_GB}" \
                 --image-id "$IMG" --subnet-id "$SUBNET" --assign-public-ip true \
                 --display-name "$NAME" \
                 --ssh-authorized-keys-file "$SSH_KEY.pub" \
                 --user-data-file "$CI_FILE" \
                 --wait-for-state RUNNING --query 'data.id' --raw-output 2>&1); then
        INST=$(printf '%s\n' "$OUT" | grep -o 'ocid1\.instance[^" ]*' | tail -1)
        break 2
      fi
      if printf '%s' "$OUT" | grep -qiE 'capacity|TooManyRequests'; then
        echo "    no capacity there"
      elif printf '%s' "$OUT" | grep -qiE 'LimitExceeded|limit'; then
        die "Service limit hit. You may already use your free A1 quota, or this is over the free limit. Details:
$OUT"
      else
        die "Launch failed:
$OUT"
      fi
    done
    echo "  all availability domains full, waiting 60s ..."
    sleep 60
  done
  [ -n "$INST" ] || die "Still no A1 capacity after $RETRY_ROUNDS rounds. Run the script again later (it resumes)."
fi
rm -f "$CI_FILE"

IP=$(oci compute instance list-vnics --instance-id "$INST" \
       --query 'data[0]."public-ip"' --raw-output)
[ -n "$IP" ] || die "Instance has no public IP."
say "Instance running at $IP"

# ---------------------------------------------------------------- deploy app
SSH="ssh -i $SSH_KEY -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 ubuntu@$IP"
say "Waiting for SSH and first-boot setup (3 to 8 minutes)"
for _ in $(seq 1 60); do $SSH true 2>/dev/null && break; sleep 10; done
$SSH 'sudo cloud-init status --wait >/dev/null; test -d ~/vidmetrics' \
  || die "First-boot setup failed. Check with: $SSH 'sudo tail -50 /var/log/cloud-init-output.log'"

say "Writing .env.local and building VidMetrics"
# Keys travel over SSH stdin, never on a command line or in instance metadata.
printf 'NEXT_PUBLIC_YOUTUBE_API_KEY=%s\nNEXT_PUBLIC_GEMINI_API_KEY=%s\n' "$YT_KEY" "$GEMINI_KEY" \
  | $SSH 'umask 077; cat > ~/vidmetrics/.env.local'

$SSH bash -s <<'REMOTE'
set -e
cd ~/vidmetrics
git pull --ff-only
npm ci
npm run build
pm2 delete vidmetrics >/dev/null 2>&1 || true
pm2 start npm --name vidmetrics -- start
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u ubuntu --hp /home/ubuntu >/dev/null
REMOTE

say "Done! VidMetrics is live at:  http://$IP"
cat <<EOF

  SSH in:      $SSH
  App logs:    $SSH 'pm2 logs vidmetrics'
  Update app:  $SSH 'cd vidmetrics && git pull && npm ci && npm run build && pm2 restart vidmetrics'
  Free HTTPS:  point your domain's A record at $IP, then run  bash https.sh
               (download it next to setup.sh; see deploy/oracle/https.sh)

EOF
