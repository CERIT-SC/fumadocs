import { i18n } from '@/lib/i18n';
import { docs, meta } from '@/.source';
import { createMDXSource } from 'fumadocs-mdx';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  i18n,
  baseUrl: '/docs',
  icon(icon) {
    if (icon)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Inevitable
      return icon as any;
  },
  source: createMDXSource(docs, meta),
});
