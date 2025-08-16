import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { remarkInclude } from 'fumadocs-mdx/config';
import { source } from '@/lib/source';
import { remarkInstall } from 'fumadocs-docgen';
import type { InferPageType } from 'fumadocs-core/source';
import { remarkAutoTypeTable } from 'fumadocs-typescript';
import remarkTransformTable from '@/lib/remark-transform-table';
import remarkRemoveCallout from '@/lib/remark-remove-callout';


const processor = remark()
  .use(remarkMdx)
  // needed for Fumadocs MDX
  .use(remarkInclude)
  .use(remarkGfm)
  .use(remarkAutoTypeTable)
  .use(remarkInstall)
  .use(remarkTransformTable)
  .use(remarkRemoveCallout);

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await processor.process({
    path: page.data._file.absolutePath,
    value: page.data.content,
  });

  return `# ${page.data.title}
URL: ${page.url}

${processed.value}`;
}
