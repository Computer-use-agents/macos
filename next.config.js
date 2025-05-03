/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/macos' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/macos/' : '',
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: process.env.NODE_ENV === 'production' 
            ? '/macos/_next/static/media/' 
            : '/_next/static/media/',
          outputPath: 'static/media/',
          name: '[name].[hash].[ext]',
        },
      },
    });

    return config;
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NODE_ENV === 'production' ? '/macos' : '',
  },
  trailingSlash: true,
};

module.exports = nextConfig; 