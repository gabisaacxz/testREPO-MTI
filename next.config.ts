/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // This raises the limit from 1MB to 10MB
    },
  },
};

export default nextConfig;