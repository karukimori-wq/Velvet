/** @type {import('next').NextConfig} */
const privateNoStore = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];
const privateRoutes = ["/", "/auth", "/people/:path*", "/capture/:path*", "/schedule/:path*", "/search", "/remember/:path*", "/import", "/settings/:path*"];

const nextConfig = {
  serverExternalPackages: ["pg", "pg-cloudflare"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=()" },
        ],
      },
      { source: "/api/:path*", headers: privateNoStore },
      ...privateRoutes.map(source => ({ source, headers: privateNoStore })),
    ];
  },
};

module.exports = nextConfig;
