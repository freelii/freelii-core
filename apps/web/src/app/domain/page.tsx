import { constructMetadata } from "@freelii/utils";
import PlaceholderContent from "./placeholder";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { domain: string } }) {
  const title = `${params.domain.toUpperCase()} - A ${
    process.env.NEXT_PUBLIC_APP_NAME || 'Freelii'
  } Custom Domain`;
  
  const description = `${params.domain.toUpperCase()} is a custom domain on ${
    process.env.NEXT_PUBLIC_APP_NAME || 'Freelii'
  } - an open-source link management tool for modern marketing teams to create, share, and track short links.`;

  return constructMetadata({
    title,
    description,
  });
}

export default function CustomDomainPage() {
  return <PlaceholderContent />;
}
