/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
          pathname: '/uploads/**',
        },
        {
          protocol: 'https',
          hostname: 'maple-server-e7ye.onrender.com',
          port: '',
          pathname: '/uploads/**',
        },
      ],
    },
  }

export default nextConfig;
