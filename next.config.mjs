/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.scdn.co'],
  },
  webpack(config) {
    // Ignore 'fs' module on the client-side (browser)
    config.node = {
      fs: 'empty',  // Cette ligne permet d'éviter l'erreur liée au module 'fs'
    };
    return config;
  },
};

export default nextConfig;
