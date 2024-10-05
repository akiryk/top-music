/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/image/**", // This allows any image path from Spotify, i.scdn.co
      },
    ],
  },
};

export default nextConfig;
