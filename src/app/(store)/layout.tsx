import Layout from "@/components/Layout";
import { ReactNode } from "react";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}
