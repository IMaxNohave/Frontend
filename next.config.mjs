/** @type {import('next').NextConfig} */

// ช่วยประกอบ URL จาก env (มี default ด้วย)
function getBackendBaseUrl() {
  if (process.env.NGINX_PROXY === undefined) {
    return "http://IMaxNohave-backend:3000";
  }
  return process.env.NGINX_PROXY;
}

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  // ใช้ rewrites เป็น dev/prod proxy ได้ตาม env
  async rewrites() {
    const backendBase = getBackendBaseUrl();
    return [
      {
        source: "/api/:path*",
        destination: `${backendBase}/:path*`,
      },
    ];
  },

  // แนะนำสำหรับ build แบบ image เล็ก
  output: "standalone",
};

export default nextConfig;
