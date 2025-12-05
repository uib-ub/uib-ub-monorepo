import type { Metadata } from "next";
import ContentSearchLayout from "@/components/layout/content-search-layout";

export const metadata: Metadata = {
  title: "Arkiv",
  description:
    "Språksamlinganes digitaliserte arkivmateriale. Dei fysiske arkiva er i hovudsak oppbevart ved Universitetsbiblioteket i Bergen",
};

export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <ContentSearchLayout name="Arkiv" route="/iiif">
      {children}
    </ContentSearchLayout>
  );
}
