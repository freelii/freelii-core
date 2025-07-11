"use client";

import { NetworkSwitcher } from "@/components/network-switcher";
import { useStellar } from "@/contexts/stellar-context";
import { XLMIcon } from "@/ui/icons/xlm-icon";
import {
  Cards,
  CreditCard,
  Facebook,
  GreekTemple,
  InvoiceDollar,
  MoneyBills2,
  Users6,
  useRouterStuff,
} from "@freelii/ui";
import { Banknote } from 'lucide-react';
import { useParams } from "next/navigation";
import { type ReactNode } from "react";
import { SidebarNav, type SidebarNavAreas } from "./sidebar-nav";
import { WalletDropdown } from "./wallet-dropdown";

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
          // {
          //   name: "Deposits",
          //   icon: ArrowsOppositeDirectionX,
          //   href: `/${slug}/deposits${queryString}`,
          // },
          // {
          //   name: "Withdrawals",
          //   icon: ArrowsOppositeDirectionY,
          //   href: `/${slug}/withdrawals${queryString}`,
          // },
          {
            name: "Payouts",
            icon: MoneyBills2,
            href: `/${slug}/payouts${queryString}`,
          },
          {
            name: "Bulk Disbursements",
            icon: Cards,
            href: `/${slug}/bulk-disbursements${queryString}`,
          },
          {
            name: "Invoices",
            icon: InvoiceDollar,
            href: `/${slug}/invoices${queryString}`,
          },
          {
            name: "Recipients",
            icon: Users6,
            href: `/${slug}/recipients${queryString}`,
          },
          {
            name: "Cards",
            icon: CreditCard,
            href: `/${slug}/cards${queryString}`,
          },
          {
            name: "Deposits",
            icon: Banknote,
            href: `/${slug}/deposits${queryString}`,
          },
          // {
          //   name: "Settings",
          //   icon: Gear,
          //   href: `/${slug}/settings`,
          //   disabled: true,
          // },
        ],
      },
      {
        name: "Network",
        items: [
          {
            name: "Network Details",
            icon: XLMIcon,
            href: `/${slug}/network-details`,
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
  const { slug } = useParams<{ slug: string }>() ?? { slug: '' };
  const { getQueryString } = useRouterStuff();
  const { network, config } = useStellar();
  //   const { data: session } = useSession();
  // TODO trpc  const { programs } = usePrograms();

  // const currentArea = useMemo(() => {
  //   return pathname.startsWith("/account/settings")
  //     ? "userSettings"
  //     : pathname.startsWith(`/${String(slug)}/settings`)
  //       ? "workspaceSettings"
  //       : "default";
  // }, [slug, pathname]);

  return (
    <SidebarNav
      areas={NAV_AREAS}
      currentArea="default"
      data={{
        slug: slug,
        queryString: getQueryString(undefined, {
          ignore: ["sortBy", "sortOrder"],
        }),
        session: undefined,
        showNews: false
      }}
      toolContent={toolContent}
      newsContent={newsContent}
      switcher={<WalletDropdown />}
      bottom={
        <>
          {/* Network Switcher */}
          <div className="p-4 border-t">
            <NetworkSwitcher className="w-full" />
          </div>
          {/* TODO <UserSurveyButton /> */}
          {/* <Usage /> */}
          <span className="text-xs text-muted-foreground p-4">© 2025 Freelii Tech, Inc. All rights reserved.</span>
        </>
      }
    />
  );
}
