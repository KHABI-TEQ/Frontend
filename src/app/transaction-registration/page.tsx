import { Suspense } from "react";
import TransactionRegistrationPortal from "@/components/transaction-registration/TransactionRegistrationPortal";

export const metadata = {
  title: "Transaction Registration | Khabiteq",
  description:
    "Register your Lagos property transaction with KHABITEQ — including off-platform deals with any licensed practitioner.",
};

export default function TransactionRegistrationPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-gray-500">Loading…</div>}>
      <TransactionRegistrationPortal />
    </Suspense>
  );
}
