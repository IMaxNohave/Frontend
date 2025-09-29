/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ใช้ rewrites เป็น dev proxy และใช้ได้ทั้ง dev/prod
  async rewrites() {
    return [
      // proxy /api/* ไปหา backend service (ชื่อคอนเทนเนอร์) พอร์ต 3000
      { source: '/api/:path*', destination: 'http://IMaxNohave-backend:3000/:path*' },
    ];
  },

  // แนะนำสำหรับ build แบบ image เล็ก
  output: 'standalone',
}

export default nextConfig
