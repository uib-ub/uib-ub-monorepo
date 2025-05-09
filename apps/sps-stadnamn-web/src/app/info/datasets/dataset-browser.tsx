'use client'
import { useState, useEffect, useContext} from 'react';
import { datasetPresentation, datasetTitles, datasetFeatures, featureNames, datasetTypes, typeNames, datasetDescriptions, datasetShortDescriptions, publishDates } from '@/config/metadata-config'
import Image from 'next/image'
import { PiCaretDown, PiCaretUp } from 'react-icons/pi';
import { useSearchParams } from 'next/navigation';
import DatasetToolbar from '@/components/ui/dataset-toolbar';
import { GlobalContext } from '@/app/global-provider';
import { fieldConfig } from '@/config/search-config';

interface FieldWithDatasets {
  label: string;
  datasets: string[];
}

export default function DatasetBrowser() {
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
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


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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
    setSelectedFilters(prevFilters =>
      prevFilters.includes(filter)
        ? prevFilters.filter(f => f !== filter)
        : [...prevFilters, filter]
    );
  };





  return (    
        <>
          <div className='flex flex-col col-span-1'>
          <div className='flex flex-col'>
          <input
              id='titleSearch'
              className='rounded-sm border border-gray-400 text-base px-2 py-1 h-8'
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
            />

          </div>
          
          <div className="flex gap-4 mt-2">
          <button className="flex items-center gap-1" onClick={() => setExpandedOption(prev => prev == 'type' ? null : 'type')} aria-controls="dataset-type" aria-expanded={expandedOption == 'type'}>
            {expandedOption == 'type' ? <PiCaretUp aria-hidden="true"/> : <PiCaretDown aria-hidden="true"/>}
            Datasettype</button>
          <button className="flex items-center gap-1" onClick={() => setExpandedOption(prev => prev == 'resources' ? null : 'resources')} aria-controls="dataset-resources" aria-expanded={expandedOption == 'resources'}>
            {expandedOption == 'resources' ? <PiCaretUp aria-hidden="true"/> : <PiCaretDown aria-hidden="true"/>}
            Ressurser</button>
          <button className="flex items-center gap-1" onClick={() => setExpandedOption(prev => prev == 'fields' ? null : 'fields')} aria-controls="dataset-fields" aria-expanded={expandedOption == 'fields'}>
            {expandedOption == 'fields' ? <PiCaretUp aria-hidden="true"/> : <PiCaretDown aria-hidden="true"/>}
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
                      <PiCaretUp aria-hidden="true" />
                      Vis færre
                    </>
                  ) : (
                    <>
                      <PiCaretDown aria-hidden="true" />
                      {`Vis alle felt (${allFields.length})`}
                    </>
                  )}
                </button>
              )}
            </div>}
          </div>
          
          <div className='xl:col-span-3'>
            <h2 className='!text-neutral-800 font-semibold !text-base !mt-0 !p-0 xl:!h-8 !mb-2 items-center flex !font-sans sr-only xl:not-sr-only'>Treff: {filteredDatasets.length} / {totalValidDatasets}</h2>
          
          <ul className="flex flex-col w-full divide-y !p-0 gap-2">
            {filteredDatasets.map((itemDataset) => (
          <li key={itemDataset} className={`h-full sm:my-0 !py-0 w-full grid grid-cols-6 relative ${searchParams.get('dataset') == itemDataset ? 'bg-accent-50' : ''}`}>
              <div className={`flex flex-col col-span-2 xl:col-span-1 w-full pt-4 ${datasetPresentation[itemDataset].img.endsWith('.svg') ? 'bg-neutral-100 p-4' : ''}`}>
                <Image 
                  src={datasetPresentation[itemDataset].img} 
                  alt="Illustrasjon" 
                  aria-describedby={itemDataset + "_attribution"} 
                  width="512" 
                  height="512" 
                  className={`w-full aspect-square sepia-[25%] grayscale-[50%] ${
    datasetPresentation[itemDataset].img.endsWith('.svg') 
      ? 'object-contain' 
      : 'object-cover'
  }`}
                />
            
              <small id={itemDataset + "_attribution"} className="text-neutral-700 text-xs p-1 sr-only">{datasetPresentation[itemDataset].imageAttribution}</small>
              </div>
              
              <div className="p-2 px-4 md:p-4 col-span-4 xl:col-span-5 flex flex-col gap-1">
                <h3 className="md:text-lg font-semibold !m-0 !p-0">{datasetTitles[itemDataset]}</h3>
                <div className="flex flex-wrap gap-4">
                  {stats?.datasets[itemDataset]?.doc_count && (
                    <div className="flex items-center gap-2 rounded-md">
                      <span className="text-sm font-medium text-neutral-600 uppercase tracking-wide">oppslag</span>
                      <span className="text-base font-semibold text-neutral-800">{stats.datasets[itemDataset].doc_count.toLocaleString()}</span>
                    </div>
                  )}
                  {publishDates[itemDataset] && (
                    <div className="flex items-center gap-2 rounded-md">
                      <span className="text-sm font-medium text-neutral-600 uppercase tracking-wide">lagt til</span>
                      <span className="text-base font-semibold text-neutral-800">{new Date(publishDates[itemDataset]).toLocaleDateString('no')}</span>
                    </div>
                  )}
                  {datasetTypes[itemDataset]?.includes('updated') && (
                    <div className="flex items-center gap-2 rounded-md">
                      <span className="text-sm font-medium text-neutral-600 uppercase tracking-wide">oppdatert</span>
                      <span className="text-base font-semibold text-neutral-800">{new Date(parseInt(stats?.datasets[itemDataset]?.timestamp) * 1000).toLocaleDateString('no')}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm space-y-4 break-words">
                <p>{isMobile ? datasetShortDescriptions[itemDataset] : datasetDescriptions[itemDataset]}</p>          
              </div>
              
              <DatasetToolbar itemDataset={itemDataset}/>
             
              </div>
              
          </li>
        ))}
      </ul>
      </div>    
      </>
  );
}