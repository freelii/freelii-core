"use client";

import { Badge, buttonVariants } from "@freelii/ui";
import { cn } from "@freelii/utils";
import Link from "next/link";
import type { CSSProperties, PropsWithChildren, ReactNode } from "react";

export function AnimatedEmptyState({
  title,
  description,
  cardContent,
  addButton,
  pillContent,
  learnMoreHref,
  learnMoreClassName,
  className,
}: {
  title: string;
  description: string;
  cardContent: ReactNode | ((index: number) => ReactNode);
  addButton?: ReactNode;
  pillContent?: string;
  learnMoreHref?: string;
  learnMoreClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-lg border border-gray-200 px-4 py-10 md:min-h-[500px]",
        className,
      )}
    >
      <div className="animate-fade-in h-36 w-full max-w-64 overflow-hidden px-4 [mask-image:linear-gradient(transparent,black_10%,black_90%,transparent)]">
        <div
          style={{ "--scroll": "-50%" } as CSSProperties}
          className="animate-infinite-scroll-y flex flex-col [animation-duration:10s]"
        >
          {new Array(6).fill(0).map((_, idx) => (
            <Card key={idx}>
              {typeof cardContent === "function"
                ? cardContent(idx % 3)
                : cardContent}
            </Card>
          ))}
        </div>
      </div>
      {pillContent && <Badge variant="blueGradient">{pillContent}</Badge>}
      <div className="max-w-xs text-pretty text-center">
        <span className="text-base font-medium text-neutral-900">{title}</span>
        <p className="mt-2 text-pretty text-sm text-neutral-500">
          {description}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {addButton}
        {learnMoreHref && (
          <Link
            href={learnMoreHref}
            target="_blank"
            className={cn(
              buttonVariants({ variant: addButton ? "secondary" : "primary" }),
              "flex h-9 items-center whitespace-nowrap rounded-lg border px-4 text-sm",
              learnMoreClassName,
            )}
          >
            Learn more
          </Link>
        )}
      </div>
    </div>
  );
}

function Card({ children }: PropsWithChildren) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_4px_12px_0_#0000000D]">
      {children}
    </div>
  );
}
