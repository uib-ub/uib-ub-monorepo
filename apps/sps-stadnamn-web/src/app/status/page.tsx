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
      
      const response = await fetch('/api/status');
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
    const timestamp = parts[parts.length - 1];
    
    if (timestamp && !isNaN(Number(timestamp))) {
      const date = new Date(Number(timestamp)*1000);
      return date.toLocaleString('nb-NO');
    }
    return null;
  };

  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4">
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
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PiDatabase className="text-3xl text-primary-600" />
            <h1 className="text-3xl font-serif text-neutral-900">Dataset Status</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PiArrowClockwise className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Update'}</span>
          </button>
        </div>
        
        {/* Filters and Search */}
        {statusData?.indices && statusData.indices.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Filter radio buttons */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700">Filter by environment:</span>
              <div className="flex flex-wrap gap-4">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'local', label: 'Local' },
                  { value: 'dev', label: 'Dev' },
                  { value: 'prod', label: 'Prod' },
                  { value: 'no-aliases', label: 'No aliases' }
                ].map((filter) => (
                  <label key={filter.value} className="flex items-center gap-2 cursor-pointer">
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
              <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg" />
              <input
                type="text"
                placeholder="Search indices..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        )}
        
        {statusData?.indices && statusData.indices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredIndices()
              .sort((a, b) => a.index.localeCompare(b.index))
              .map((index) => {
              const title = [index.index.split('-').slice(2).join('-')]
              const envAliases = index.aliases.filter(alias => !alias.includes('-all'))
              const sourceAliases = index.aliases.filter(alias => alias.includes('-all'))
              const sourceAliasEnvs = sourceAliases.map(alias => alias.split('-')[2])
            
              return (
              <div key={index.index} className="bg-white shadow-lg rounded-xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  {/* Header Section */}
                  <div className="flex flex-col gap-3 pb-4 border-b border-neutral-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-neutral-900 font-mono break-all">
                        {title}
                      </h2>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50">
                        <PiCircle className={`text-sm ${getStatusColor(index.status)}`} />
                        <span className={`text-sm font-medium ${getStatusColor(index.status)} capitalize`}>
                          {index.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="py-4 border-b border-neutral-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-medium text-neutral-600">Documents</span>
                      <span className="text-lg text-neutral-900 font-mono">
                        {index.doc_count.toLocaleString('nb-NO')}
                      </span>
                    </div>
                    {extractTransformationDate(index.index) && (
                      <div className="flex items-center justify-between">
                        <span className="text-base font-medium text-neutral-600">Transformed</span>
                        <span className="text-lg text-neutral-900 font-mono">
                          {extractTransformationDate(index.index)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Aliases Section */}
                  <div className="pt-4 space-y-4">
                    {/* Env Aliases */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <PiTag className="text-neutral-500 text-sm" />
                        <span className="font-medium text-neutral-900 text-sm">Environment Aliases</span>
                      </div>
                      {envAliases.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
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
                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-${color}-100 text-${color}-800 border border-${color}-200`}
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
                        <div className="flex items-center gap-2 mb-2">
                          <PiCheck className="text-neutral-500 text-sm" />
                          <span className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                            Included in cross-dataset search
                          </span>
                        </div>
                        {envAliases.some(envAlias => !sourceAliasEnvs.includes(envAlias.split('-')[2])) && (
                          <div className="flex items-center gap-2 mb-2">
                            <PiX className="text-yellow-500 text-sm" />
                            <span className="font-medium text-yellow-900 text-sm flex items-center gap-2">
                              Warning: Not all environments have cross-search aliases
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <PiX className="text-neutral-500 text-sm" />
                        <span className="font-medium text-neutral-900 text-sm flex items-center gap-2">
                          Not included in cross-dataset search
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
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
            <PiDatabase className="mx-auto text-4xl text-neutral-400 mb-4" />
            <h2 className="text-lg font-semibold text-neutral-700 mb-2">No Indices Found</h2>
            <p className="text-neutral-600">No Elasticsearch indices are currently available.</p>
          </div>
        )}

        {/* Summary */}
        {statusData?.indices && getFilteredIndices().length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-4">
            <h3 className="font-semibold text-neutral-900 mb-2">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
