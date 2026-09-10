/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'framer-motion', 'swiper'],
    },
    images: {
        // Bypass /_next/image: the Vercel optimization quota is spent and
        // uncached transforms return 402. See lib/image-loader.js.
        loader: 'custom',
        loaderFile: './lib/image-loader.js',
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 2678400,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'via.placeholder.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'img.freepik.com',
            }
        ],
    }
};

export default nextConfig;
