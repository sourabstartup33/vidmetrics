import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'i.pravatar.cc' },
      { hostname: 'yt3.googleusercontent.com' },
      { hostname: 'yt3.ggpht.com' },
      { hostname: 'picsum.photos' },
      { hostname: 'i.ytimg.com' },
      { hostname: 'img.youtube.com' },
    ],
  },
};

export default nextConfig;
