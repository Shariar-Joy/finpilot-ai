import { notFound } from "next/navigation";
import { FinanceApp } from "@/components/finance-app";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    ![
      "dashboard",
      "transactions",
      "budgets",
      "bills",
      "insights",
      "agent",
      "activity",
      "settings",
    ].includes(section)
  )
    notFound();
  return <FinanceApp section={section} />;
}
