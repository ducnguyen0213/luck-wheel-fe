/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bỏ qua lỗi ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Bỏ qua lỗi TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 