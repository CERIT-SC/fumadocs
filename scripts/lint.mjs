import {
  printErrors,
  readFiles,
  scanURLs,
  validateFiles,
} from 'next-validate-link';
import { getSlugs, parseFilePath } from 'fumadocs-core/source';
import { getTableOfContents } from 'fumadocs-core/server';
import path from 'node:path';
 
async function checkLinks() {
  // we read them all at once to avoid repeated file read
  const docsFiles = await readFiles('content/docs/**/*.{md,mdx}', 
                                    {
                                            pathToUrl: (file) => {
                                                   return path.dirname(file).replace(/^content\//, 'en/');
                                      }
                                    }
  );

  const publicFiles = await readFiles('public/**', { pathToUrl: (file) => { return path.dirname(file); }});

  // other collections too!
  const scanned = await scanURLs({
    populate: {
      '[lang]/docs/[[...slug]]': docsFiles.map((file) => {
        const info = parseFilePath(path.relative('content/docs', file.path));

        return {
          value: { lang: 'en',
                   slug: getSlugs(info) },
          hashes: getTableOfContents(file.content).map((item) =>
            item.url.slice(1),
          ),
        };
      }),
    },
  });

  for (const key of publicFiles.keys()) {
     scanned.urls.set(publicFiles[key].path.replace(/^public/, ''), { value: {}, hashes: []});
  }

  scanned.fallbackUrls = [ { url: /^$/, meta: {} } ];

  printErrors(
    await validateFiles([...docsFiles], {
            scanned,
            checkExternal: true,
    }),
    true,
  );
}
 
void checkLinks();
