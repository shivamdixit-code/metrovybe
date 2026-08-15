export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import CRMLayoutClient from "./CRMLayoutClient";

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CRMLayoutClient>{children}</CRMLayoutClient>;
}
