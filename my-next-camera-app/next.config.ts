import type { NextConfig } from "next";


const nextConfig = {
  reactStrictMode: true,
  experimental: {},  // Remove `appDir` if it's inside this object
};

module.exports = {
  reactStrictMode: true,
  experimental: {
    appDir: true
  }
}




export default nextConfig;
