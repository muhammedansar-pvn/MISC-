/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  pageExtensions: ['tsx', 'ts'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
