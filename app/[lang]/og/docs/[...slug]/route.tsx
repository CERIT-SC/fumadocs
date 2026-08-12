import { extname } from 'node:path';
import { readFile } from 'node:fs/promises';
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { getPageImage, source } from '@/lib/source';
import { i18n } from '@/lib/i18n';
import { appName, logo } from '@/lib/shared';

export const revalidate = false;

// brand colours, kept in sync with app/[lang]/global.css
const accentColor = '#24a9c2'; // --color-fd-primary
const titleColor = '#0f172a';
const descriptionColor = '#64748b';
const siteColor = '#302658'; // e-INFRA logo navy

const mimeTypes: Record<string, string> = {
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

/**
 * `public/` is mounted at runtime, so the logo is read from disk instead of
 * imported. Failing to read it must not break the whole route.
 */
const logoDataUri = readFile(`./public${logo}`)
  .then(
    (buffer) =>
      `data:${mimeTypes[extname(logo)] ?? 'image/png'};base64,${buffer.toString('base64')}`,
  )
  .catch(() => undefined);

export async function GET(
  _req: Request,
  { params }: RouteContext<'/[lang]/og/docs/[...slug]'>,
) {
  const { lang, slug } = await params;
  // the last segment is `image.png`
  const page = source.getPage(slug.slice(0, -1), lang);
  if (!page) notFound();

  return new ImageResponse(
    (
      <Template
        title={page.data.title}
        description={page.data.description}
        icon={await logoDataUri}
        site={appName}
      />
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale ?? i18n.defaultLanguage,
    slug: getPageImage(page).segments,
  }));
}

function Template({
  title,
  description,
  site,
  icon,
}: {
  title: ReactNode;
  description?: ReactNode;
  site?: ReactNode;
  icon?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '72px',
        backgroundColor: '#ffffff',
        backgroundImage: `linear-gradient(135deg, rgba(36,169,194,0.10) 0%, rgba(255,255,255,0) 55%)`,
        borderBottom: `20px solid ${accentColor}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.15,
            color: titleColor,
          }}
        >
          {title}
        </p>
        {description ? (
          <p
            style={{
              margin: 0,
              marginTop: 24,
              fontSize: 40,
              lineHeight: 1.3,
              color: descriptionColor,
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          marginTop: 'auto',
        }}
      >
        {icon ? <img src={icon} width={166} height={62} alt="" /> : null}
        <p style={{ margin: 0, fontSize: 40, fontWeight: 600, color: siteColor }}>
          {site}
        </p>
      </div>
    </div>
  );
}
