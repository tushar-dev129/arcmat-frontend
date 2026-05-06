/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/proxy/:path*',
                // destination: 'http://54.209.61.106:8000/api/:path*',
                destination: 'http://localhost:8000/api/:path*'
            },
        ];
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/api/public/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'arcmat-api.vercel.app',
            },
            {
                protocol: 'https',
                hostname: 'arcmat.s3.us-east-1.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'arcmatv2.s3.ap-south-1.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },

};

export default nextConfig;
