import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: process.env.STARTPAGE,
        permanent: false,
      }
    ];
  },
};

export default withMDX(config);
