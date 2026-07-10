import type { Metadata } from 'next/types';

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    alternates: {
      ...override.alternates,
    },
  };
}

export const baseUrl =
  process.env.NODE_ENV === 'development' || !process.env.HOST
    ? new URL('http://localhost:3000')
    : new URL(`https://${process.env.HOST}`);
