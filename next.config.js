/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // enables self-contained build for Docker deployment
};
module.exports = nextConfig;