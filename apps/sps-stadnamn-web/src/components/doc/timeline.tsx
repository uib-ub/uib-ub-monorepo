export default function Timeline({attestations}: {attestations: {year: string, label: string}[]}) {
    const grouped: Record<string,string[]> = {};

    attestations?.forEach(item => {
        if (grouped[item.year]) {
            grouped[item.year].push(item.label);
        } else {
            grouped[item.year] = [item.label];
        }
    });

    const timelineData: Record<string, string[]>[] = Object.keys(grouped).map(year => {
        return { [year]: grouped[year] };
      });


  return (
    <ul className='relative !mx-2 !px-0'>
      {timelineData.map((item, index) => {
        const [year, labels] = Object.entries(item)[0];
  
        return (
          <li key={index} className='flex items-center !pb-2 !pt-0 relative md:!pb-2'>

          <div className={`bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
          <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1`}></div>
          
          

          <div className={`ml-6 ${''}`}>
            <strong className='mb-1'>{year}:&nbsp;</strong>
                {labels.map((label, i) => ( <span key={i}>
                  {labels.length > 1 && i > 0 ? ', ' : ''}<span className=' list-none !py-0' key={i}>{label}</span>
                  </span>
                ))}
          </div>
        </li>
        );
      }
      )}
    </ul>
  );
}