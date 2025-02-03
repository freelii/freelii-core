"use client";

import { useWalletStore } from '@/hooks/stores/wallet-store';
import { api } from "@/trpc/react";
import {
  Popover,
  Skeleton,
  useScrollProgress
} from "@freelii/ui";
import { cn } from "@freelii/utils";
import { ChevronsUpDown, Plus, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  useRef,
  useState
} from "react";

export function WalletDropdown() {
  const {
    isLoading,
    wallets,
    getSelectedWallet
  } = useWalletStore();

  const [openPopover, setOpenPopover] = useState(false);

  // Query wallets with TRPC

  const selected = getSelectedWallet();

  if (isLoading) {
    return <WalletDropdownSkeleton />;
  }

  return (
    <div>
      <Popover
        content={
          <WalletList
            selected={selected}
            wallets={wallets || []}
            setOpenPopover={setOpenPopover}
          />
        }
        align="start"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg p-1.5 text-left text-sm transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80",
            "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
          )}
        >
          {selected ? (
            <div className="flex min-w-0 items-center gap-x-2.5 pr-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 block">
                <div className="truncate text-sm font-medium leading-5 text-neutral-900">
                  {selected.alias}
                </div>
                <div className="flex items-center gap-1">
                  {selected.balances?.map((balance, index) => (
                    <span key={balance.currency} className="text-xs text-gray-500">
                      {index > 0 && "• "}
                      {balance.amount} {balance.currency}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No wallet selected</div>
          )}
          <ChevronsUpDown
            className="size-4 shrink-0 text-gray-400"
            aria-hidden="true"
          />
        </button>
      </Popover>
    </div>
  );
}

function WalletDropdownSkeleton() {
  return (
    <div className="flex w-full items-center justify-between rounded-lg p-1.5">
      <div className="flex min-w-0 items-center gap-x-2.5 pr-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <div className="min-w-0 block">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      </div>
    </div>
  );
}


function WalletList({
  selected,
  wallets,
  setOpenPopover,
}: {
  selected: ReturnType<typeof getSelectedWallet>;
  wallets: Awaited<ReturnType<typeof api.wallet.getAll.query>>;
  setOpenPopover: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollProgress, updateScrollProgress } = useScrollProgress(scrollRef);

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        onScroll={updateScrollProgress}
        className="relative max-h-80 w-full space-y-0.5 overflow-auto rounded-lg bg-white text-base sm:w-64 sm:text-sm"
      >
        <div className="p-2">
          <div className="flex items-center justify-between pb-1">
            <p className="px-1 text-xs font-medium text-neutral-500">
              My Wallets
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            {wallets.map((wallet) => {
              const isActive = selected?.id === wallet.id;
              return (
                <button
                  key={wallet.id}
                  onClick={() => {
                    useWalletStore.getState().setSelectedWalletId(wallet.id);
                    setOpenPopover(false);
                  }}
                  className={cn(
                    "relative flex w-full items-center gap-x-2 rounded-md px-2 py-1.5 transition-all duration-75",
                    "hover:bg-neutral-200/50 active:bg-neutral-200/80",
                    "outline-none focus-visible:ring-2 focus-visible:ring-black/50",
                    isActive && "bg-neutral-200/50"
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="block truncate text-sm leading-5 text-neutral-900">
                      {wallet.alias}
                    </span>
                    <div className="flex items-center gap-1">
                      {wallet.balances.map((balance, index) => (
                        <span key={balance.currency} className="text-xs text-gray-500">
                          {index > 0 && "• "}
                          {balance.amount} {balance.currency}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
            <button
              onClick={() => {
                setOpenPopover(false);
                // TODO: Add wallet creation modal
              }}
              className="group flex w-full cursor-pointer items-center gap-x-2 rounded-md p-2 text-neutral-700 transition-all duration-75 hover:bg-neutral-200/50 active:bg-neutral-200/80"
            >
              <Plus className="mx-1.5 size-4 text-neutral-500" />
              <span className="block truncate">Add new wallet</span>
            </button>
          </div>
        </div>
      </div>
      {/* Bottom scroll fade */}
      <div
        className="pointer-events-none absolute -bottom-px left-0 h-16 w-full rounded-b-lg bg-gradient-to-t from-white sm:bottom-0"
        style={{ opacity: 1 - Math.pow(scrollProgress, 2) }}
      />
    </div>
  );
}

const getPlanColor = (plan: string) =>
  plan === "enterprise"
    ? "text-purple-700"
    : plan.startsWith("business")
      ? "text-blue-900"
      : plan === "pro"
        ? "text-cyan-900"
        : "text-neutral-500";
