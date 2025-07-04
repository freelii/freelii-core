import { MaxWidthWrapper } from "@freelii/ui";
import { cn } from "@freelii/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";
import UserDropdown from "../sidebar/user-dropdown";
import { NavButton } from "./nav-button";

export function PageContent({
  title,
  titleBackButtonLink,
  titleControls,
  description,
  children,
  className,
}: PropsWithChildren<{
  title?: ReactNode;
  titleBackButtonLink?: string;
  titleControls?: ReactNode;
  description?: ReactNode;
  className?: string;
}>) {
  const hasTitle = title !== undefined;
  const hasDescription = description !== undefined;

  return (
    <div className={cn("bg-neutral-100 md:bg-transparent", className)}>
      <MaxWidthWrapper
        className={cn(
          "mt-1",
          (hasTitle || hasDescription) && "md:mt-3 md:py-3",
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NavButton />
            {(hasTitle || hasDescription) && (
              <div>
                {hasTitle && (
                  <div className="flex items-center gap-2">
                    {titleBackButtonLink && (
                      <Link
                        href={titleBackButtonLink}
                        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        <ChevronLeft className="size-5" />
                      </Link>
                    )}
                    <h1 className="text-lg font-medium tracking-tight text-gray-900 leading-7">
                      {title}
                    </h1>
                  </div>
                )}
                {hasDescription && (
                  <p className="mt-1 hidden text-base text-neutral-500 md:block">
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
          {titleControls && (
            <div className="hidden md:block">{titleControls}</div>
          )}
          <div className="flex items-center gap-4 md:hidden">
            <UserDropdown />
          </div>
        </div>
      </MaxWidthWrapper>
      <div className="bg-white md:bg-transparent pt-2.5 max-md:mt-3 max-md:rounded-t-[16px]">
        {hasDescription && (
          <MaxWidthWrapper className="">
            <p className="mb-3 mt-1 text-base text-neutral-500 md:hidden">
              {description}
            </p>
          </MaxWidthWrapper>
        )}
        {children}
      </div>
    </div>
  );
}
