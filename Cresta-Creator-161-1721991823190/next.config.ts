
require('dotenv').config({ path: './.env' }); // This line ensures .env is loaded

import type {NextConfig} from 'next';
import withPWAInit from "next-pwa";

const isProduction = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: !isProduction,
});


const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.pinterest.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' ,
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default isProduction ? withPWA(nextConfig) : nextConfig;
