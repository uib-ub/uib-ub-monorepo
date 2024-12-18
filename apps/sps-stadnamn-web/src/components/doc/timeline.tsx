import SearchLink from "../ui/search-link";

export default function Timeline(arr: { label: string; year: string }[]) {
  const grouped: Record<string,string[]> = {};

  arr?.forEach(item => {
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
  <ul className='relative !mx-2 !px-0 p-2 mt-2'>
    {timelineData.map((item, index) => {
      const [year, labels] = Object.entries(item)[0];

      return (
        <li key={index} className='flex items-center !pb-4 !pt-0 relative'>

        <div className={`bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
        <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1`}></div>
        
        

        <div className={`ml-6`}>
          <span><ParamLink add={{attestationYear: year}} className='no-underline font-semibold whitespace-nowrap py-0 px-2 mr-2 my-1 bg-primary-100 border border-primary-300 shadow-sm rounded-full'>{year}</ParamLink></span>
              {labels.map((label, i) => ( 
                <span key={i}>{i < labels.length && i > 0 ? ', ': ''}{label}</span>
               
              ))}
        </div>
      </li>
      );
    }
    )}
  </ul>
);
}