"use client"

import { PageContent } from "@/ui/layout/page-content";
import { MaxWidthWrapper } from "@freelii/ui";
import PageClient from "./page-client";

export default function WorkspacePage() {
  return (
    <PageContent title="Welcome back!">
      <MaxWidthWrapper>
        <PageClient />
      </MaxWidthWrapper>
    </PageContent>
  );
}
