import { DisclaimerBanner } from "@/ui/layout/disclaimer-banner";
import { MainNav } from "@/ui/layout/main-nav";
import { AppSidebarNav } from "@/ui/layout/sidebar/app-sidebar-nav";
import { ModalProvider } from "@/ui/modals/modal-provider";
import { TooltipProvider } from "@freelii/ui";
import { constructMetadata } from "@freelii/utils";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

export const dynamic = "force-static";
export const metadata = constructMetadata();

export default async function Layout({ children }: { children: ReactNode }) {

  return (
    <div className="min-h-screen w-full">
      <DisclaimerBanner />
      <SessionProvider>
        <TooltipProvider>
          <ModalProvider>
            <MainNav
              sidebar={AppSidebarNav}
              toolContent={
                <>
                  {/* <ReferButton /> */}
                  {/* <HelpButtonRSC /> */}
                </>
              }
            // newsContent={<NewsRSC />}
            >
              {children}
            </MainNav>
          </ModalProvider>
        </TooltipProvider>
      </SessionProvider>
      {/* <Toolbar show={["onboarding"]} /> */}
    </div>
  );
}
