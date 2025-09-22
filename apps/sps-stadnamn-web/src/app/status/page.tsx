'use client'
import { datasetTitles } from '@/config/metadata-config';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PiDatabase, PiCircle, PiTag, PiMagnifyingGlass, PiArrowClockwise, PiX, PiCheck } from 'react-icons/pi';

interface IndexData {
  index: string;
  aliases: string[];
  doc_count: number;
  size_in_bytes: number;
  status: string;
}

interface StatusResponse {
  indices?: IndexData[];
  error?: string;
  details?: string;
  status?: string;
}

export default function StatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Initialize state from URL parameters
  useEffect(() => {
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    
    setSelectedFilter(filter);
    setSearchTerm(search);
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (newFilter: string, newSearch: string) => {
    const params = new URLSearchParams();
    
    if (newFilter !== 'all') {
      params.set('filter', newFilter);
    }
    
    if (newSearch.trim()) {
      params.set('search', newSearch.trim());
    }
    
    const paramString = params.toString();
    const newURL = paramString ? `?${paramString}` : '/status';
    
    router.replace(newURL, { scroll: false });
  };

  const handleFilterChange = (newFilter: string) => {
    setSelectedFilter(newFilter);
    updateURL(newFilter, searchTerm);
  };

  const handleSearchChange = (newSearch: string) => {
    setSearchTerm(newSearch);
    updateURL(selectedFilter, newSearch);
  };

  const fetchStatus = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch('/api/status', {cache: 'no-store'});
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }
      
      setStatusData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    fetchStatus(true);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'green': return 'text-green-600';
      case 'yellow': return 'text-yellow-600';
      case 'red': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };

  const getFilteredIndices = () => {
    if (!statusData?.indices) return [];
    
    return statusData.indices.filter((index) => {
      // Text search filter
      const matchesSearch = index.index.toLowerCase().includes(searchTerm.toLowerCase()) ||
        index.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // If "all" is selected, only apply text search
      if (selectedFilter === 'all') return matchesSearch;
      
      // If "no-aliases" is selected, show indices with no aliases
      if (selectedFilter === 'no-aliases') {
        return matchesSearch && index.aliases.length === 0;
      }
      
      // Environment filter - check if any alias has the selected environment
      const hasMatchingTag = index.aliases.some(alias => {
        const environment = alias.split('-')[2];
        return environment === selectedFilter;
      });
      
      return matchesSearch && hasMatchingTag;
    });
  };

  const extractTransformationDate = (indexName: string): string | null => {
    const parts = indexName.split('-');
    const timestamp = parts[parts.length - 2];
    
    if (timestamp && !isNaN(Number(timestamp))) {
      const date = new Date(Number(timestamp)*1000);
      return date.toLocaleString('nb-NO');
    }
    return null;
  };


  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-50">
        <div className="flex items-center gap-2 text-neutral-600">
          <PiDatabase className="animate-pulse text-2xl" />
          <span>Loading status...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h1 className="text-xl font-semibold text-red-800 mb-2">Status Check Failed</h1>
          <p className="text-red-700">{error}</p>
        </div>
      </main>
    );
  }

  

  return (
    <main className="px-4 py-6 bg-neutral-50 !h-full flex-grow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif text-neutral-900">Index Status</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <PiArrowClockwise className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Reloading...' : 'Reload indices'}</span>
          </button>
        </div>
        
        {/* Filters and Search */}
        {statusData?.indices && statusData.indices.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Filter radio buttons */}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-neutral-700">Filter by environment:</span>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'local', label: 'Local' },
                  { value: 'dev', label: 'Dev' },
                  { value: 'prod', label: 'Prod' },
                  { value: 'no-aliases', label: 'No aliases' }
                ].map((filter) => (
                  <label key={filter.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="environment-filter"
                      value={filter.value}
                      checked={selectedFilter === filter.value}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700">{filter.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Search field */}
            <div className="relative max-w-md">
              <PiMagnifyingGlass className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-neutral-400 text-base" />
              <input
                type="text"
                placeholder="Search indices..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
              />
            </div>
          </div>
        )}
        
        {statusData?.indices && statusData.indices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {getFilteredIndices()
              .sort((a, b) => a.index.localeCompare(b.index))
              .map((index) => {
              const title = [index.index.split('-').slice(2).join('-')]
              const envAliases = index.aliases.filter(alias => !alias.includes('-all'))
              const sourceAliases = index.aliases.filter(alias => alias.includes('-all'))
              const sourceAliasEnvs = sourceAliases.map(alias => alias.split('-')[2])
            
              return (
              <div key={index.index} className="bg-white shadow-md rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 relative">
                {/* Fading overlay when refreshing */}
                {refreshing && (
                  <div 
                    className="absolute inset-0 bg-white/80 rounded-lg z-10" 
                    style={{
                      animation: 'fade 0.8s ease-in-out infinite alternate'
                    }}
                  />
                )}
                
                <div className="p-3">
                  {/* Header Section */}
                  <div className="flex flex-col gap-2 pb-2 border-b border-neutral-100">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-semibold text-neutral-900 font-mono break-all leading-tight">
                        {title}
                      </h2>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-50 flex-shrink-0">
                        <PiCircle className={`text-sm ${getStatusColor(index.status)}`} />
                        <span className={`text-sm font-medium ${getStatusColor(index.status)} capitalize`}>
                          {index.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="py-2 border-b border-neutral-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-600">Documents</span>
                      <span className="text-base text-neutral-900 font-mono">
                        {index.doc_count.toLocaleString('nb-NO')}
                      </span>
                    </div>
                    {extractTransformationDate(index.index) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-600">Transformed</span>
                        <span className="text-sm text-neutral-900 font-mono">
                          {extractTransformationDate(index.index)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Aliases Section */}
                  <div className="pt-2 space-y-2">
                    {/* Env Aliases */}
                    <div>
                      {envAliases.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {envAliases.map((alias) => {
                            const environment = alias.split('-')[2]
                            const color = {
                              'local': 'neutral',
                              'dev': 'accent',
                              'prod': 'primary',
                            }[environment]
                            return (
                              <span
                                key={alias}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-${color}-100 text-${color}-800 border border-${color}-200`}
                              >
                                {environment}
                              </span>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-500 italic">No environment aliases</span>
                      )}
                    </div>

                    {/* Source Aliases */}
                    {sourceAliases.length > 0 ? (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <PiCheck className="text-green-500 text-sm" />
                          <span className="font-medium text-neutral-900 text-sm">
                            Cross-search enabled
                          </span>
                        </div>
                        {envAliases.some(envAlias => !sourceAliasEnvs.includes(envAlias.split('-')[2])) && (
                          <div className="flex items-center gap-1">
                            <PiX className="text-yellow-500 text-sm" />
                            <span className="font-medium text-yellow-900 text-sm">
                              Warning: Incomplete coverage
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <PiX className="text-neutral-500 text-sm" />
                        <span className="font-medium text-neutral-900 text-sm">
                          No cross-search
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-center">
            <PiDatabase className="mx-auto text-3xl text-neutral-400 mb-3" />
            <h2 className="text-base font-semibold text-neutral-700 mb-1">No Indices Found</h2>
            <p className="text-sm text-neutral-600">No Elasticsearch indices are currently available.</p>
          </div>
        )}

        {/* Summary */}
        {statusData?.indices && getFilteredIndices().length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-3">
            <h3 className="font-semibold text-neutral-900 mb-2 text-base">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex flex-col">
                <span className="text-neutral-600">
                  {selectedFilter === 'all' ? 'Total' : 'Filtered'} Indices
                </span>
                <span className="text-xl font-semibold text-neutral-900">
                  {getFilteredIndices().length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-600">
                  {selectedFilter === 'all' ? 'Total' : 'Filtered'} Documents
                </span>
                <span className="text-xl font-semibold text-neutral-900">
                  {getFilteredIndices()
                    .reduce((sum, index) => sum + index.doc_count, 0)
                    .toLocaleString('nb-NO')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-600">
                  {selectedFilter === 'all' ? 'Total' : 'Filtered'} Size (including replicas)
                </span>
                <span className="text-xl font-semibold text-neutral-900">
                  {formatBytes(
                    getFilteredIndices().reduce((sum, index) => sum + index.size_in_bytes, 0)
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
