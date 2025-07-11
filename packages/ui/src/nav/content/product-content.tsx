import { cn, createHref } from "@freelii/utils";
import Link from "next/link";
import { COMPARE_PAGES, CUSTOMER_STORIES } from "../../content";
import { FeatherFill, Icon } from "../../icons";
import { AnalyticsGraphic } from "./graphics/analytics-graphic";
import { LinksGraphic } from "./graphics/links-graphic";
import {
  LargeLinkCard,
  contentHeadingClassName,
} from "./shared";

const largeLinks = [
  {
    title: "Dub API",
    description: "Programmatic link creation at scale",
    icon: FeatherFill,
    href: "/docs/api-reference/introduction",
  },
  {
    title: "Dub Integrations",
    description: "Connect Dub with your favorite tools",
    icon: FeatherFill,
    href: "/docs/integrations",
  },
];

interface FeatureItemProps {
  icon: Icon;
  title: string;
  description?: string;
  href: string;
}

function FeatureItem({ icon: Icon, title, description, href }: FeatureItemProps) {
  return (
    <a href={href} className="block rounded-lg p-3 hover:bg-gray-100">
      <div className="flex items-center">
        <Icon className="h-5 w-5" />
        <div className="ml-3">
          <div className="font-medium">{title}</div>
          {description && <div className="text-sm text-gray-600">{description}</div>}
        </div>
      </div>
    </a>
  );
}

export function ProductContent({ domain }: { domain: string }) {
  return (
    <div className="grid w-[1020px] grid-cols-[repeat(2,minmax(0,1fr)),0.8fr] gap-4 p-5">
      <Link
        href={createHref("/home", domain)}
        className="group relative flex flex-col rounded-xl border border-neutral-100 bg-neutral-50 dark:border-white/20 dark:bg-white/10"
      >
        <div className="p-5 pb-0">
          <span className="text-sm font-medium text-neutral-900 dark:text-white">
            Dub Links
          </span>
          <p className="mt-3 max-w-56 text-sm text-neutral-500 dark:text-white/60">
            Short links with superpowers for the modern marketer
          </p>
        </div>
        <div className="relative grow overflow-hidden">
          <LinksGraphic className="absolute bottom-0 h-auto w-full [mask-image:linear-gradient(transparent,black_20%,black_80%,transparent)]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#f4950c,transparent)] opacity-[0.07] transition-opacity duration-150 group-hover:opacity-[0.2]" />
      </Link>
      <div className="flex flex-col gap-4">
        <Link
          href={createHref("/analytics", domain)}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 dark:border-white/20 dark:bg-white/10"
        >
          <AnalyticsGraphic className="absolute bottom-0 h-auto w-full translate-y-[15%] [mask-image:linear-gradient(90deg,transparent,black)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#36D78F,transparent)] opacity-[0.07] transition-opacity duration-150 group-hover:opacity-[0.2]" />
          <div className="h-56 p-5">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">
              Dub Analytics
            </span>
            <p className="mt-3 max-w-48 text-sm text-neutral-500 dark:text-white/60">
              Powerful real-time analytics with conversion tracking
            </p>
          </div>
        </Link>
        <div className="grid grow grid-rows-2 gap-4">
          {largeLinks.map(({ title, description, icon, href }) => (
            <LargeLinkCard
              key={title}
              title={title}
              description={description}
              icon={icon}
              href={createHref(href, domain)}
            />
          ))}
        </div>
      </div>
      <div className="pl-2 pt-2">
        <p className={cn(contentHeadingClassName, "mb-2")}>Customer Stories</p>

        <p className={cn(contentHeadingClassName, "mb-2 mt-5")}>Compare</p>
       
      </div>
    </div>
  );
}
