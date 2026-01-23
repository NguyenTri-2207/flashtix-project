/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Dòng này cực quan trọng khi deploy lên AWS ECS
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Để load ảnh demo từ Unsplash
      },
    ],
  },
};

export default nextConfig;