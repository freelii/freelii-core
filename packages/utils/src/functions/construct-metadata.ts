import { Metadata } from "next";
import { HOME_DOMAIN } from "../constants";

export function constructMetadata({
  title,
  fullTitle,
  description = "Smart Business Banking",
  image = "/logo.png",
  video,
  icons = [
    {
      rel: "apple-touch-icon",
      sizes: "32x32",
      url: "/Freelii-ribbon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon.ico",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon.ico",
    },
  ],
  canonicalUrl,
  noIndex = false,
}: {
  title?: string;
  fullTitle?: string;
  description?: string;
  image?: string | null;
  video?: string | null;
  icons?: Metadata["icons"];
  canonicalUrl?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title:
      fullTitle ||
      (title
        ? `${title} | Freelii`
        : "Payments layer for AI Agents"),
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: image,
      }),
      ...(video && {
        videos: video,
      }),
    },
    icons,
    metadataBase: new URL(HOME_DOMAIN),
    ...(canonicalUrl && {
      alternates: {
        canonical: canonicalUrl,
      },
    }),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
