import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: process.env.STARTPAGE,
        permanent: false,
      },
      {
        source: '/en/platform/overview',
        destination: process.env.STARTPAGE,
        permanent: false,
      }
    ];
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default withMDX(config);
