/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: '/',
      destination: '/index.html',
    },
  ],
};

module.exports = nextConfig;
