import { getPageMarkdownUrl, source } from '@/lib/source';


export async function GET(req: Request, { params }: RouteContext<'/[lang]/llms.txt'>) {
  const lang = (await params).lang;
  const protocol = req.headers.get('x-forwarded-proto') || 'http';
  const baseUrl =  `${protocol}://${req.headers.get('host')}`;
  const scanned = source.getPages(lang).map(getPageMarkdownUrl).map((page) => `${baseUrl}/${lang}${page.url}`);

  return new Response(scanned.join('\n'));
}