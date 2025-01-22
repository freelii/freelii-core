import { CardList, useMediaQuery } from "@freelii/ui";

type Subaccount = {
  id: string;
  name: string;
  slug: string;
};

export function SubaccountCard({ subaccount }: { subaccount: Subaccount }) {
  const { isMobile } = useMediaQuery();

  return (
    <>
      <CardList.Card
        key={subaccount.id}
        innerClassName="flex items-center gap-5 sm:gap-8 md:gap-12 text-sm"
      >
      </CardList.Card>
    </>
  );
}
