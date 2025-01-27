"use client";

import {
  Calendar6,
  Facebook,
  GreekTemple,
  InvoiceDollar,
  useRouterStuff,
  Users6
} from "@freelii/ui";
import { useParams, usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { SidebarNav, SidebarNavAreas } from "./sidebar-nav";

const NAV_AREAS: SidebarNavAreas<{
  slug: string;
  queryString: string;
  // session?: Session | null;
  showNews?: boolean;
}> = {
  // Top-level
  default: ({ slug, queryString, showNews }) => ({
    showSwitcher: true,
    showNews,
    direction: "left",
    content: [
      {
        name: "Main",
        items: [
          {
            name: "Home",
            icon: GreekTemple,
            href: `/${slug}`,
            exact: true,
          },
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
  const { slug } = useParams();
  const pathname = usePathname();
  const { getQueryString } = useRouterStuff();
  //   const { data: session } = useSession();
  // TODO trpc  const { programs } = usePrograms();

  const programs = [{ id: "1" }];

  const currentArea = useMemo(() => {
    return pathname.startsWith("/account/settings")
      ? "userSettings"
      : pathname.startsWith(`/${String(slug)}/settings`)
        ? "workspaceSettings"
        : pathname.startsWith(`/${String(slug)}/payouts`)
          ? "payments"
          : "default";
  }, [slug, pathname]);

  return (
    <SidebarNav
      areas={NAV_AREAS}
      currentArea={currentArea}
      data={{
        slug: (slug ?? "") as string,
        queryString: getQueryString(undefined, {
          ignore: ["sortBy", "sortOrder"],
        }),
        session: undefined, // TODO session || undefined,
        showNews: pathname.startsWith(`/${String(slug)}/programs/`) ? false : true,
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
