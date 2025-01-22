import { NewBackground } from "@/ui/shared/new-background";
import { Nav, Footer } from "@freelii/ui";

export default function CustomDomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gray-50/80">
      {/* TODO: <NavMobile /> */}
      <Nav />
      {children}
      <NewBackground />
    </div>
  );
}
