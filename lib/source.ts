import { i18n } from '@/lib/i18n';
import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  i18n,
  baseUrl: '/docs',
  icon(icon) {
    if (icon)
      return icon as any;
  },
  source: createMDXSource(docs, meta),
});
