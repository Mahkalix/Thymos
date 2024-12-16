/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.scdn.co'],
  },
  webpack(config) {
    // Ignore le module fs
    config.resolve.fallback = {
      fs: false, // Utilisation de `false` pour "ignorer" le module
    };

    return config;
  },
};

export default nextConfig;
