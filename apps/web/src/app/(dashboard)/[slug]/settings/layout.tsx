import SettingsLayout from "@/ui/layout/settings-layout";
import { type ReactNode } from "react";

export default function WorkspaceSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SettingsLayout>{children}</SettingsLayout>;
}
