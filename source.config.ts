import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import remarkSmartypants from 'remark-smartypants';

export const { docs, meta } = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
	lastModifiedTime: 'git',
	mdxOptions: {
          remarkPlugins: [remarkSmartypants],
        },
});
