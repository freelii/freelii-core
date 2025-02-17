"use client";

import { noop } from "@freelii/utils/functions";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext
} from "react";
import { useImportCsvModal } from "./import-csv-modal";

export const ModalContext = createContext<{
  setShowImportCsvModal: Dispatch<SetStateAction<boolean>>;
}>({
  setShowImportCsvModal: noop,
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const { ImportCsvModal, setShowImportCsvModal } = useImportCsvModal();

  return (
    <ModalContext.Provider value={{ setShowImportCsvModal }}>
      {children}
      <ImportCsvModal />
    </ModalContext.Provider>
  );
}

function ModalProviderClient({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const { setShowImportCsvModal, ImportCsvModal } = useImportCsvModal();


  // const [hashes, setHashes] = useCookies<SimpleLinkProps[]>("hashes__dub", [], {
  //   domain: !!process.env.NEXT_PUBLIC_VERCEL_URL ? ".dub.co" : undefined,
  // });

  // useEffect(() => {
  //   if (hashes.length > 0 && workspaceId) {
  //     toast.promise(
  //       fetch(`/api/links/sync?workspaceId=${workspaceId}`, {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(hashes),
  //       }).then(async (res) => {
  //         if (res.status === 200) {
  //           await mutatePrefix("/api/links");
  //           setHashes([]);
  //         }
  //       }),
  //       {
  //         loading: "Importing links...",
  //         success: "Links imported successfully!",
  //         error: "Something went wrong while importing links.",
  //       },
  //     );
  //   }
  // }, [hashes, workspaceId]);

  // handle invite and oauth modals


  const { data: session, update } = useSession();


  return (
    <ModalContext.Provider
      value={{
        setShowImportCsvModal,
      }}
    >
      <ImportCsvModal />
      {children}
    </ModalContext.Provider>
  );
}
