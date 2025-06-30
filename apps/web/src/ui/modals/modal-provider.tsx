"use client";

import { noop } from "@freelii/utils/functions";
import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction
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


