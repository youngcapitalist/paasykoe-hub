/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // Serve TikTok carousel images from the verified paasykoe.fi domain,
      // proxying to the Vercel Blob store. BLOB_BASE is the store base URL
      // e.g. https://<storeid>.public.blob.vercel-storage.com
      {
        source: "/_tiktok/:path*",
        destination: `${process.env.BLOB_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
