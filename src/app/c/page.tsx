import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const h = params.h as string | undefined;
  const b = params.b as string | undefined;
  const s = params.s as string | undefined;

  const urlParams = new URLSearchParams();
  if (h) urlParams.set('h', h);
  if (b) urlParams.set('b', b);
  if (s) urlParams.set('s', s);

  const ogImageUrl = `/api/og?${urlParams.toString()}`;

  return {
    title: 'INKCLO Coordinate',
    description: 'My Splatoon3 Coordinate',
    openGraph: {
      title: 'INKCLO Coordinate',
      description: 'My Splatoon3 Coordinate',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Coordinate Preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'INKCLO Coordinate',
      description: 'My Splatoon3 Coordinate',
      images: [ogImageUrl],
    },
  };
}

export default async function CoordinateSharePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  // TODO: In the future, pass these params to the /create page to auto-load the coordinate.
  // For now, just redirect to the app.
  redirect(`/create`);
}
