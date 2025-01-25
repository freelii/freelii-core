"use client";

import {
  Calendar6,
  //   Books2,
  //   CircleInfo,
  //   ConnectedDots,
  //   ConnectedDots4,
  //   CubeSettings,
  //   Gear2,
  //   Gift,
  //   Globe, 
  Facebook,
  InvoiceDollar, useRouterStuff, Users6
} from "@freelii/ui";
// import { Session } from "next-auth";
// import { useSession } from "next-auth/react";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
// import UserSurveyButton from "../user-survey";
// import { CursorRays } from "./icons/cursor-rays";
// import { Gear } from "./icons/gear";
// import { Hyperlink } from "./icons/hyperlink";
// import { LinesY } from "./icons/lines-y";
import { SidebarNav, SidebarNavAreas } from "./sidebar-nav";
// import { Usage } from "./usage";

const NAV_AREAS: SidebarNavAreas<{
  slug: string;
  queryString: string;
  programs?: { id: string }[];
  // session?: Session | null;
  showNews?: boolean;
}> = {
  // Top-level
  default: ({ slug, queryString, programs, showNews }) => ({
    showSwitcher: true,
    showNews,
    direction: "left",
    content: [
      {
        name: "Main",
        items: [
          // {
          //   name: "Home",
          //   icon: GreekTemple,
          //   href: `/${slug}`,
          //   exact: true,
          // },
          // {
          //   name: "Sub-Accounts",
          //   icon: ConnectedDots,
          //   href: `/${slug}/accounts${queryString}`,
          // },
          {
            name: "Payouts",
            icon: InvoiceDollar,
            href: `/${slug}/payouts${queryString}`,
          },
          {
            name: "Recipients",
            icon: Users6,
            href: `/${slug}/recipients${queryString}`,
          },
          // {
          //   name: "Deposits",
          //   icon: CreditCard,
          //   href: `/${slug}/deposits${queryString}`,
          // },
          // {
          //   name: "Settings",
          //   icon: Gear,
          //   href: `/${slug}/settings`,
          //   disabled: true,
          // },
        ],
      }],
  }),
  // Payments
  payments: ({ slug }) => ({
    title: "Payouts",
    backHref: `/${slug}`,
    content: [
      {
        name: "Payouts",
        items: [

          {
            name: "Account Payouts",
            icon: Calendar6,
            href: `/${slug}/payouts`,
          },
        ],
      },
    ],
  }),

  // Workspace settings
  workspaceSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    content: [
      {
        name: "Workspace",
        items: [
          {
            name: "Billing",
            icon: InvoiceDollar,
            href: `/${slug}/settings/billing`,
          },
          {
            name: "People",
            icon: Facebook,
            href: `/${slug}/settings/people`,
          },
          {
            name: "Integrations",
            icon: Facebook,
            href: `/${slug}/settings/integrations`,
          },
          {
            name: "Security",
            icon: Facebook,
            href: `/${slug}/settings/security`,
          },
        ],
      },
      {
        name: "Developer",
        items: [
          {
            name: "API Keys",
            icon: Facebook,
            href: `/${slug}/settings/tokens`,
          },
          {
            name: "OAuth Apps",
            icon: Facebook,
            href: `/${slug}/settings/oauth-apps`,
          },
          {
            name: "Webhooks",
            icon: Facebook,
            href: `/${slug}/settings/webhooks`,
          },
        ],
      },
      {
        name: "Account",
        items: [
          {
            name: "Notifications",
            icon: Facebook,
            href: `/${slug}/settings/notifications`,
          },
        ],
      },
    ],
  }),

  // User settings
  userSettings: ({ slug }) => ({
    title: "Settings",
    backHref: `/${slug}`,
    content: [
      {
        name: "Account",
        items: [
          {
            name: "General",
            icon: Facebook,
            href: "/account/settings",
            exact: true,
          },
          {
            name: "Security",
            icon: Facebook,
            href: "/account/settings/security",
          },
        ],
      },
    ],
  }),
};

export function AppSidebarNav({
  toolContent,
  newsContent,
}: {
  toolContent?: ReactNode;
  newsContent?: ReactNode;
}) {
  const { slug } = useParams() as { slug?: string };
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();
  //   const { data: session } = useSession();
  // TODO trpc  const { programs } = usePrograms();

  const programs = [{ id: "1" }];

  const currentArea = useMemo(() => {
    return pathname.startsWith("/account/settings")
      ? "userSettings"
      : pathname.startsWith(`/${slug}/settings`)
        ? "workspaceSettings"
        : pathname.startsWith(`/${slug}/payouts`)
          ? "payments"
          : "default";
  }, [slug, pathname]);

  return (
    <SidebarNav
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        slug: slug || "",
        queryString: getQueryString(undefined, {
          ignore: ["sortBy", "sortOrder"],
        }),
        programs,
        session: undefined, // TODO session || undefined,
        showNews: pathname.startsWith(`/${slug}/programs/`) ? false : true,
      }}
      toolContent={toolContent}
      newsContent={newsContent}
      // switcher={<WorkspaceDropdown />}
      bottom={
        <>
          {/* TODO <UserSurveyButton /> */}
          {/* <Usage /> */}
          <span className="text-xs text-muted-foreground p-4">© 2025 Freelii, LLC. All rights reserved.</span>
        </>
      }
    />
  );
}
