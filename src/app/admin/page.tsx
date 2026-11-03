import type { Metadata } from "next";
import AdminPromo from "../../components/AdminPromo";

export const metadata: Metadata = {
  title: "Admin | The Diamond Collective",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPromo />;
}
