import { PageContent } from "@/ui/layout/page-content";
import WorkspaceLinksClient from "./page-client";
import { SignedIn } from "@clerk/nextjs";

export default function WorkspaceLinks() {
  return (
    <PageContent title="Links">
      Content
      <WorkspaceLinksClient />
    </PageContent>
  );
}
