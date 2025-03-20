/** @type {import('next').NextConfig} */

const nextConfig = {
  transpilePackages: ["@getpara/react-sdk", "@getpara/web-sdk", "@getpara/*"]
};

module.exports = nextConfig;