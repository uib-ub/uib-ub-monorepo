import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main id="main" className=" container dataset-info stable-scrollbar overflow-auto">
      <ReactSwagger spec={spec} />
    </main>
  );
}