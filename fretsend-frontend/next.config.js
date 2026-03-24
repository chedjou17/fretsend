/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: ['localhost'] },
   typescript: {
    ignoreBuildErrors: true, // ✅ ignore TS
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ ignore ESLint
  },
};
module.exports = nextConfig;
