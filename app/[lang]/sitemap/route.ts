import { source } from '@/lib/source';
import { NextResponse } from 'next/server';

export const revalidate = false;

export async function GET(req: Request) {
  const headers = req.headers;
  const protocol = headers.get('x-forwarded-proto') || 'http';
  const host = headers.get('host');
  const baseUrl = `${protocol}://${host}`;

  const pages = source.getPages();
  const urls = pages
    .map((page) => `${baseUrl}${page.url}.mdx`)
    .join('\n');

  return new NextResponse(urls, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

