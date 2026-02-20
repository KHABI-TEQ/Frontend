

import { ReactNode } from "react";
import AdminNavbar from "@/components/admincomponents/navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main className="w-screen min-h-full flex ">
      <AdminNavbar />
      {/* Content */}
      <section className="flex-1 p-4">{children}</section>
    </main>
  );
}
