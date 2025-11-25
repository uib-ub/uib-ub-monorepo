'use client'

import { ApiReferenceReact } from '@scalar/api-reference-react'
import React, { useState } from 'react'

export const ClientWrapper = () => {
  const [isLoading, setIsLoading] = useState(true)

  const uibUbApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://api.ub.uib.no/openapi' // <-- replace with your actual prod URL
      : 'http://localhost:3009/openapi'

  const handleLoaded = () => {
    setIsLoading(false)
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold mb-2">Loading API Documentation</h2>
            <p className="">Please wait while we fetch the latest API specifications...</p>
          </div>
        </div>
      )}

      <ApiReferenceReact
        configuration={{
          sources: [
            {
              title: 'UiB-UB API',
              slug: 'uib-ub',
              url: uibUbApiUrl,
            },
            /* {
              title: 'Ordbokene API',
              slug: 'ordbokene',
              url: 'https://v1.ordbokene.no/api/swagger.yml',
            }, */
            {
              title: 'SAMLA API v2',
              slug: 'samla-v2',
              url: 'https://samla.no/viewer/api/v2/openapi.json',
            },
            {
              title: 'SAMLA API v1',
              slug: 'samla-v1',
              url: 'https://samla.no/viewer/api/v1/openapi.json',
            },
          ],
          hideDarkModeToggle: true,
          searchHotKey: 'l',
          theme: 'none',
          defaultOpenAllTags: true,
          isLoading: isLoading,
          onLoaded: handleLoaded,
        }}
      />
    </div>
  )
}