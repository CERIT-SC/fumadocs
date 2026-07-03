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
        permanent: true,
      },
      {
        source: '/:lang/docs',
        destination: process.env.STARTPAGE,
        permanent: true,
      },
      {
        source: '/:lang',
        destination: process.env.STARTPAGE,
        permanent: true,
      }
    ];
  },
};

export default withMDX(config);
