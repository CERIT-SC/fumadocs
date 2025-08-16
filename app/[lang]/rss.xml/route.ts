import { Feed } from 'feed';
import { NextResponse } from 'next/server';
import { source } from '@/lib/source';

export const revalidate = false;

export function GET(req: Request) {
  const { headers } = req;
  const protocol = headers.get('x-forwarded-proto') || 'http';
  const host = headers.get('host');
  const baseUrl = `${protocol}://${host}`;

  const feed = new Feed({
    title: 'e-INFRA Documentation',
    id: `${baseUrl}/en/docs`,
    link: `${baseUrl}/en/docs`,
    language: 'en',
    copyright: 'All rights reserved 2025, e-INFRA CZ',
  });

  const page = source.getPage(['/en/docs/news'], 'en'); 
  let time=new Date();
  if (page && page.data.lastModified) {
          time = page.data.lastModified ;
  }

  feed.addItem({
    id: '/en/docs/news',
    title: 'News',
    link: `${baseUrl}/en/docs/news`,
    date: time,

    author: [
      {
        name: 'e-INFRA CZ',
      },
    ],
  });

  return new NextResponse(feed.rss2());
}
