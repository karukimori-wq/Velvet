/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare"]
};

module.exports = nextConfig;
