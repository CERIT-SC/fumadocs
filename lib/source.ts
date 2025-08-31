import { i18n } from '@/lib/i18n';
import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';

export const source = loader({
  i18n,
  baseUrl: '/docs',
  icon(icon) {
    if (icon)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Inevitable
      return icon as any;
  },
  source: docs.toFumadocsSource(),
});

export type Page = InferPageType<typeof source>;
export type Meta = InferMetaType<typeof source>;
