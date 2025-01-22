"use client";

import SubAccountDisplay from "@/ui/subaccounts/subaccount-display";
import SubaccountsContainer from "@/ui/subaccounts/subaccounts-container";
import { LinksDisplayProvider } from "@/ui/subaccounts/subaccount-display-providers";
import { ThreeDots } from "@freelii/ui";
import {
  Button,
  IconMenu,
  MaxWidthWrapper,
  Popover,
  useMediaQuery,
} from "@freelii/ui";
import { Download, Globe, TableIcon } from "@freelii/ui";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

export default function WorkspaceLinksClient() {
  const { data: session } = {
    data: {
      user: {
        id: "123",
        email: "test@test.com",
        name: "Test User",
      },
    },
  };

  return (
    <LinksDisplayProvider>
      <WorkspaceLinks />
    </LinksDisplayProvider>
  );
}

function WorkspaceLinks() {
  const router = useRouter();


  const { slug } = {
    slug: "test",
  };

  // TODO
  const useLinkFilters = ()=> {
    return {
      filters: [],
      activeFilters: [],
      onSelect: () => {},
      onRemove: () => {},
      onRemoveAll: () => {},
      setSearch: () => {},
      setSelectedFilter: () => {},
    }
  }

  const {
    filters,
    activeFilters,
    onSelect,
    onRemove,
    onRemoveAll,
    setSearch,
    setSelectedFilter,
  } = useLinkFilters();

  // TODO
  const { isValidating } = { isValidating: false };

  return (
    <>
      <div className="flex w-full items-center pt-3">
        <MaxWidthWrapper className="flex flex-col gap-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 lg:flex-nowrap">
            <div className="flex w-full grow gap-2 md:w-auto">
              <div className="grow basis-0 md:grow-0">
                Filters :)
              </div>
              <div className="grow basis-0 md:grow-0">
                <SubAccountDisplay />
              </div>
            </div>
            <div className="flex gap-x-2 max-md:w-full">
              <MoreLinkOptions />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
      <div className="mt-3">
        <SubaccountsContainer CreateLinkButton={() => <div>Create Link Button</div>} />
      </div>
    </>
  );
}

const MoreLinkOptions = () => {
  const router = useRouter();
  const { slug } = {
    slug: "test",
  }
  const { isMobile } = useMediaQuery();
  const [openPopover, setOpenPopover] = useState(false);
  const [state, setState] = useState<"default" | "import">("default");

  useEffect(() => {
    if (!openPopover) setState("default");
  }, [openPopover]);

  return (
    <>
      <Popover
        content={
          <div className="w-full md:w-52">
            <div className="grid gap-px p-2">
              <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-gray-500">
                Import Links
              </p>
              <ImportOption
                onClick={() => {
                  setOpenPopover(false);
                  router.push(`/${slug}?import=bitly`);
                }}
                setOpenPopover={setOpenPopover}
              >
                <IconMenu
                  text="Import from Bitly"
                  icon={
                    <img
                      src="https://assets.dub.co/misc/icons/bitly.svg"
                      alt="Bitly logo"
                      className="h-4 w-4"
                    />
                  }
                />
              </ImportOption>
              <ImportOption
                onClick={() => {
                  setOpenPopover(false);
                  router.push(`/${slug}?import=rebrandly`);
                }}
                setOpenPopover={setOpenPopover}
              >
                <IconMenu
                  text="Import from Rebrandly"
                  icon={
                    <img
                      src="https://assets.dub.co/misc/icons/rebrandly.svg"
                      alt="Rebrandly logo"
                      className="h-4 w-4"
                    />
                  }
                />
              </ImportOption>
              <ImportOption
                onClick={() => {
                  setOpenPopover(false);
                  router.push(`/${slug}?import=short`);
                }}
                setOpenPopover={setOpenPopover}
              >
                <IconMenu
                  text="Import from Short.io"
                  icon={
                    <img
                      src="https://assets.dub.co/misc/icons/short.svg"
                      alt="Short.io logo"
                      className="h-4 w-4"
                    />
                  }
                />
              </ImportOption>
              <ImportOption
                onClick={() => {
                  setOpenPopover(false);
                  router.push(`/${slug}?import=csv`);
                }}
                setOpenPopover={setOpenPopover}
              >
                <IconMenu
                  text="Import from CSV"
                  icon={<TableIcon className="size-4" />}
                />
              </ImportOption>
            </div>
            <div className="border-t border-gray-200" />
            <div className="grid gap-px p-2">
              <p className="mb-1.5 mt-1 flex items-center gap-2 px-1 text-xs font-medium text-gray-500">
                Export Links
              </p>
              <button
                onClick={() => {
                  setOpenPopover(false);
                }}
                className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
              >
                <IconMenu
                  text="Export as CSV"
                  icon={<Download className="h-4 w-4" />}
                />
              </button>
            </div>
          </div>
        }
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        align="end"
      >
        <Button
          onClick={() => setOpenPopover(!openPopover)}
          variant="secondary"
          className="w-auto px-1.5"
          icon={<ThreeDots className="h-5 w-5 text-gray-500" />}
        />
      </Popover>
    </>
  );
};

function ImportOption({
  children,
  setOpenPopover,
  onClick,
}: {
  children: ReactNode;
  setOpenPopover: Dispatch<SetStateAction<boolean>>;
  onClick: () => void;
}) {
  const { slug, exceededLinks, nextPlan } = {
    slug: "test",
    exceededLinks: false,
    nextPlan: {
      name: "Test Plan",
    },
  };

  return (
    <button
      onClick={onClick}
      className="w-full rounded-md p-2 hover:bg-gray-100 active:bg-gray-200"
    >
      {children}
    </button>
  );
}
