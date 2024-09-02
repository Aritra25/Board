/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com", // Allow images from img.clerk.com
      },
    ],
  },
};

export default nextConfig;
