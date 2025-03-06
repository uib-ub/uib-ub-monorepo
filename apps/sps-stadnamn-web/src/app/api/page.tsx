import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";

export default async function IndexPage() {
  const spec = await getApiDocs();
  return (
    <main id="main" className=" container dataset-info">
      <ReactSwagger spec={spec} />
    </main>
  );
}