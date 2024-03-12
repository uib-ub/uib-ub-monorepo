export default function InfoBox({ items: items }: { items: Record<string,any>[] }) {
    const filteredItems = items.filter(item => item.value !== undefined && item.value !== null && item.value !== '');
    return (
      <div className="flex flex-wrap gap-8">
        {filteredItems.map((item: Record<string,any> , index: number) => (
            <div key={index} className="flex flex-col">
                <strong className="text-neutral-900">{item.title}</strong>
                <p>{item.value}</p>
            </div>
        ))}
            
     </div>
  
    )
  
  
  }