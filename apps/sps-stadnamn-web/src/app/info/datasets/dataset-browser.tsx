'use client'
import { useState, useEffect, useContext} from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames, datasetDescriptions, datasetShortDescriptions, publishDates } from '@/config/metadata-config'
import Image from 'next/image'
import { PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold, PiFunnel, PiMagnifyingGlass } from 'react-icons/pi';
import { useSearchParams, useRouter } from 'next/navigation';
import DatasetToolbar from '@/components/ui/dataset-toolbar';
import { GlobalContext } from '@/state/providers/global-provider';
import { fieldConfig } from '@/config/search-config';
import DatasetStats from './dataset-stats';
interface FieldWithDatasets {
  label: string;
  datasets: string[];
}

export default function DatasetBrowser() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Initialize state from URL parameters
  const [selectedFilters, setSelectedFilters] = useState<string[]>(() => {
    const types = searchParams.getAll('types');
    const resources = searchParams.getAll('resources'); 
    const fields = searchParams.getAll('fields');
    return [...types, ...resources, ...fields];
  });
  
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return searchParams.get('search') || '';
  });
  
  const [expandedOption, setExpandedOption] = useState<string | null>(() => {
    return searchParams.get('expanded') || null;
  });
  
  const [stats, setStats] = useState<any>(null);
  const [showAllFields, setShowAllFields] = useState(false);

  const allFeatures = Object.keys(featureNames);
  const allTypes = Object.keys(typeNames);
  const totalValidDatasets = Object.keys(datasetTitles)
    .filter(dataset => !dataset.includes("_") && dataset !== 'search' && dataset !== 'all').length;

  const [filteredDatasets, setFilteredDatasets] = useState<string[]>([])
  const { isMobile } = useContext(GlobalContext)

const allFields = Object.values(fieldConfig.all).reduce<FieldWithDatasets[]>((acc, field) => {
  if (!field.label || !field.datasets) return acc;
  
  const existingField = acc.find(f => f.label === field.label);
  if (existingField) {
    existingField.datasets = [...new Set([...existingField.datasets, ...field.datasets])];
  } else {
    acc.push({ label: field.label, datasets: field.datasets });
  }
  return acc;
}, [])
  .filter(field => field.datasets.length < totalValidDatasets)
  .sort((a, b) => b.datasets.length - a.datasets.length)
  .map(f => f.label);

  // Update URL when filters change
  const updateURL = (newFilters: string[], newSearchTerm: string, newExpandedOption: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params
    params.delete('types');
    params.delete('resources');
    params.delete('fields');
    params.delete('search');
    params.delete('expanded');
    
    // Categorize filters and add to params
    newFilters.forEach(filter => {
      if (Object.keys(typeNames).includes(filter)) {
        params.append('types', filter);
      } else if (Object.keys(featureNames).includes(filter)) {
        params.append('resources', filter);
      } else {
        params.append('fields', filter);
      }
    });
    
    // Add search term
    if (newSearchTerm) {
      params.set('search', newSearchTerm);
    }
    
    // Add expanded option
    if (newExpandedOption) {
      params.set('expanded', newExpandedOption);
    }
    
    // Use Next.js router to update URL
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    updateURL(selectedFilters, newSearchTerm, expandedOption);
  };

  useEffect(() => {
    const titleMatch: string[] = []
    const contentMatch: string[] = []
    const first_filtering = Object.keys(datasetTitles).filter(dataset => !dataset.includes("_"))
          .filter(dataset => dataset != 'search' && dataset != 'all')
          .filter(dataset =>
            selectedFilters.every(filter => {
              // Check if it's a feature
              if (Object.keys(featureNames).includes(filter)) {
                return (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(filter);
              }
              // Check if it's a type
              if (Object.keys(typeNames).includes(filter)) {
                return (datasetTypes as {[key: string]: string[]})[dataset]?.includes(filter);
              }
              // If it's neither, it must be a field - check in fieldConfig
              const fieldEntry = Object.values(fieldConfig.all).find(f => f.label === filter);
              return fieldEntry?.datasets?.includes(dataset) || false;
            })
          )
    // Datasets match
    if (searchTerm?.length) {

      first_filtering.forEach(dataset => {
        if (datasetTitles[dataset].toLowerCase().includes(searchTerm.toLowerCase())) {
          titleMatch.push(dataset)
        }
        else if (datasetDescriptions[dataset]?.toLowerCase().includes(searchTerm.toLowerCase())) {
          contentMatch.push(dataset)
        }
      })

      setFilteredDatasets([...titleMatch, ...contentMatch])
    }
    else {
      setFilteredDatasets(first_filtering)
    }
  }
  , [searchTerm, selectedFilters])


  useEffect(() => {
    fetch('/api/stats').then(response => response.json()).then(data => {
      setStats(data)
    }).catch(() =>
      setStats(null))}
  , [])



  const handleFilterChange = (filter: string) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter];
    
    setSelectedFilters(newFilters);
    updateURL(newFilters, searchTerm, expandedOption);
  };

  const handleExpandedOptionChange = (option: string | null) => {
    setExpandedOption(option);
    updateURL(selectedFilters, searchTerm, option);
  };





  return (    
        <>
          <div className='flex flex-col col-span-1'>
          <div className='flex w-full bg-white border border-neutral-300 rounded-md focus-within:border-primary-600 xl:border-none xl:outline xl:outline-1 xl:outline-neutral-300 xl:focus-within:border-neutral-200 xl:rounded-md items-center relative group focus-within:xl:outline-2 focus-within:xl:outline-neutral-600'>
            <PiMagnifyingGlass className="text-xl shrink-0 text-neutral-600 group-focus-within:text-neutral-800 ml-3" aria-hidden="true"/>
            <label htmlFor="titleSearch" className="sr-only">Søk i datasett</label>
            <label htmlFor="titleSearch" className="sr-only">Søk i datasett</label>
            <input
              id='titleSearch'
              className='bg-transparent px-3 py-2 focus:outline-none flex w-full shrink text-base'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  (e.target as HTMLInputElement).blur();
                  e.preventDefault();
                }
              }}
            />
          </div>
          
          <div className="flex gap-4 mt-2">
          <button className="flex items-center gap-1" onClick={() => handleExpandedOptionChange(expandedOption == 'type' ? null : 'type')} aria-controls="dataset-type" aria-expanded={expandedOption == 'type'}>
            {expandedOption == 'type' ? <PiCaretUpBold aria-hidden="true"/> : <PiCaretDownBold aria-hidden="true"/>}
            Datasettype</button>
          <button className="flex items-center gap-1" onClick={() => handleExpandedOptionChange(expandedOption == 'resources' ? null : 'resources')} aria-controls="dataset-resources" aria-expanded={expandedOption == 'resources'}>
            {expandedOption == 'resources' ? <PiCaretUpBold aria-hidden="true"/> : <PiCaretDownBold aria-hidden="true"/>}
            Ressurser</button>
          <button className="flex items-center gap-1" onClick={() => handleExpandedOptionChange(expandedOption == 'fields' ? null : 'fields')} aria-controls="dataset-fields" aria-expanded={expandedOption == 'fields'}>
            {expandedOption == 'fields' ? <PiCaretUpBold aria-hidden="true"/> : <PiCaretDownBold aria-hidden="true"/>}
            Felt</button>
          <div className="ml-auto xl:sr-only" role="status" aria-live="polite">{filteredDatasets.length} / {totalValidDatasets}</div>
          </div>
          
            
            
            { expandedOption == 'type' && <ul id="dataset-type" className="flex flex-wrap xl:flex-col gap-x-4 mt-2 gap-y-2 justify-equal !list-none">
              {allTypes.map(type => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetTypes as {[key: string]: string[]})[dataset]?.includes(type)).length;
                if (resultCount > 0) {
                return (
                    <li key={type} className='space-x-1'>
                    <input
                        type="checkbox"
                        id={type}
                        checked={selectedFilters.includes(type)}
                        onChange={() => handleFilterChange(type)}
                    />
                    <label htmlFor={type}>{(typeNames as {[key: string]: string})[type]} <span className='rounded-sm p-0 px-1 bg-neutral-800 text-white text-xs'>{resultCount}</span></label>
                    </li>
                );
                }
                }}
                )}
            </ul>}
    
            
            { expandedOption == 'resources' &&  <ul id="dataset-resources" className="flex flex-wrap xl:flex-col  gap-x-4 mt-2 gap-y-2 justify-equal !list-none">
              {allFeatures.map(feature => {{
                const resultCount = filteredDatasets.filter(dataset => (datasetFeatures as {[key: string]: string[]})[dataset]?.includes(feature)).length;
                if (resultCount > 0) {
                return (
                    <li key={feature} className='space-x-1'>
                    <input
                        type="checkbox"
                        id={feature}
                        checked={selectedFilters.includes(feature)}
                        onChange={() => handleFilterChange(feature)}
                    />
                    <label htmlFor={feature}>{(featureNames as {[key: string]: string})[feature]} <span className='rounded-sm p-0 px-1 bg-neutral-800 text-white text-xs'>{resultCount}</span></label>
                    </li>
                );
                }
                }}
                )}
            </ul>}

            { expandedOption == 'fields' && <div>
              <ul id="dataset-fields" className="flex flex-wrap xl:flex-col gap-x-4 mt-2 gap-y-2 justify-equal !list-none">
                {allFields
                  .slice(0, showAllFields ? undefined : 10)
                  .map(fieldLabel => {
                    // Get all datasets that have this field by finding the original field config entry
                    const fieldEntry = Object.values(fieldConfig.all).find(f => f.label === fieldLabel);
                    if (!fieldEntry?.datasets) return null;
                    
                    const resultCount = filteredDatasets.filter(dataset => 
                      fieldEntry.datasets?.includes(dataset)
                    ).length;

                    if (resultCount > 0) {
                      return (
                        <li key={fieldLabel} className='space-x-1'>
                          <input
                            type="checkbox"
                            id={fieldLabel}
                            checked={selectedFilters.includes(fieldLabel)}
                            onChange={() => handleFilterChange(fieldLabel)}
                          />
                          <label htmlFor={fieldLabel}>{fieldLabel} <span className='rounded-sm p-0 px-1 bg-neutral-800 text-white text-xs'>{resultCount}</span></label>
                        </li>
                      );
                    }
                  })}
              </ul>
              {allFields.length > 15 && (
                <button 
                  onClick={() => setShowAllFields(!showAllFields)}
                  className="flex items-center gap-1 mt-4 text-neutral-800"
                >
                  {showAllFields ? (
                    <>
                      <PiCaretUpBold aria-hidden="true" />
                      Vis færre
                    </>
                  ) : (
                    <>
                      <PiCaretDownBold aria-hidden="true" />
                      {`Vis alle felt (${allFields.length})`}
                    </>
                  )}
                </button>
              )}
            </div>}
          </div>
          
          <div className='xl:col-span-3'>
            <h2 className='!text-neutral-800 font-semibold !text-base !mt-0 !p-0 xl:!h-8 !mb-2 items-center flex !font-sans sr-only xl:not-sr-only'>Treff: {filteredDatasets.length} / {totalValidDatasets}</h2>
          
            <ul className="flex flex-col w-full divide-y !p-0 !list-none">
            {filteredDatasets.filter(datasset => datasetPresentation[datasset]).map((itemDataset) => (
          <li key={itemDataset} className={`w-full !py-4 ${searchParams.get('dataset') == itemDataset ? 'bg-accent-50 border-accent-200' : ''}`}>
              <div className="grid grid-cols-[5rem_minmax(0,1fr)] xl:grid-cols-[10rem_minmax(0,1fr)] gap-x-4 items-start xl:items-stretch">
                <div className={`w-20 xl:w-40 h-20 xl:h-auto xl:self-stretch ${datasetPresentation[itemDataset].img.endsWith('.svg') ? 'bg-neutral-100 p-2 rounded' : ''}`}>
                  <Image 
                    src={datasetPresentation[itemDataset].img} 
                    alt="Illustrasjon" 
                    aria-describedby={itemDataset + "_attribution"} 
                    width="256" 
                    height="256" 
                    className={`w-full h-full object-cover sepia-[25%] grayscale-[50%] rounded ${
      datasetPresentation[itemDataset].img.endsWith('.svg')
        ? 'object-contain' 
        : 'object-cover'
    }`}
                  />
                  <small id={itemDataset + "_attribution"} className="text-neutral-700 text-xs p-1 sr-only">{datasetPresentation[itemDataset].imageAttribution}</small>
                </div>

                {/* Content column */}
                <div className="min-w-0 col-start-2">
                  {/* Header: title + stats inline on mobile, stacked on xl */}
                  <div className="flex flex-col items-start justify-center gap-1 mb-2 self-center">
                    <h3 className="!text-xl font-serif !p-0 !font-normal text-neutral-900 !m-0 break-words">{datasetTitles[itemDataset]}</h3>
                    <div className="max-w-full">
                      <DatasetStats statsItem={stats?.datasets?.[itemDataset]} itemDataset={itemDataset}/>
                    </div>
                  </div>

                  {/* Desktop: description + toolbar in right column */}
                  {!isMobile && (
                    <div className="flex flex-col gap-3 xl:gap-4">
                      <p className="text-sm text-neutral-700">
                        {datasetDescriptions[itemDataset]}
                      </p>
                      <DatasetToolbar itemDataset={itemDataset}/>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile: description + toolbar below grid, full width */}
              {isMobile && (
                <div className="flex flex-col gap-3 mt-3">
                  <p className="text-sm text-neutral-700">
                    {datasetShortDescriptions[itemDataset]}
                  </p>
                  <DatasetToolbar itemDataset={itemDataset}/>
                </div>
              )}
          </li>
        ))}
      </ul>
      </div>    
      </>
  );
}