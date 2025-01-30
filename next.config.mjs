/** @type {import('next').NextConfig} */

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-scripts.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: *.graphassets.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;

const nextConfig = {
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Content-Security-Policy",
          value: cspHeader.replace(/\n/g, ""),
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eu-west-2.graphassets.com",
      },
    ],
  },
};

export default nextConfig;
