import type { Metadata } from "next";
import PromoPermission from "../../components/PromoPermission";

export const metadata: Metadata = {
  title: "Promo Permission | The Diamond Collective",
  robots: { index: false, follow: false },
};

export default function PromoPermissionPage() {
  return <PromoPermission />;
}
