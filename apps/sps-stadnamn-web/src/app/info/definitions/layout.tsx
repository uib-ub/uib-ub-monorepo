import DefinitionBrowserContainer from "./definition-browser-container";

export default async function DefinitionsLayout({ children }: { children: React.ReactNode }) {

    return <div className="flex flex-col gap-8">
        <div className="flex flex-col">
        {children}
        </div>
        <DefinitionBrowserContainer/>
    
    </div>
  }

 