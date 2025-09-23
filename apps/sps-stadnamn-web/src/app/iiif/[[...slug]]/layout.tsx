import ContentSearchLayout from "@/components/layout/content-search-layout";

export default function Page({ children }: { children: React.ReactNode }) {
    return (
      <ContentSearchLayout>
        {children}
      </ContentSearchLayout>
    )
  }
  