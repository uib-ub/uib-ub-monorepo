import React, {createContext} from 'react'
import { initialState } from '..'
import { searchReducer } from '../../shared/searchReducer'

const SearchContext = createContext()

function SearchProvider({children}) {
  const [state, dispatch] = React.useReducer(searchReducer, initialState)
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = {state, dispatch}
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}

function useImportType() {
  const context = React.useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useImportType must be used within a SearchProvider')
  }
  return context
}

function useStore() {
  const context = React.useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a SearchProvider')
  }
  return context
}

export {SearchProvider, useImportType, useStore}
