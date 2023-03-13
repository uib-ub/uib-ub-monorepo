export const searchReducer = (state, action) => {
  switch (action.type) {
    case 'SEARCH_REQUEST':
      return {
        ...state,
        loading: true,
        errorMessage: null,
        searchParameter: action.searchParameter,
      }
    case 'SEARCH_SUCCESS':
      return {
        ...state,
        loading: false,
        items: action.payload,
        totalElements: action.totalElements,
        page: action.page,
      }
    case 'SEARCH_FAILURE':
      return {
        ...state,
        loading: false,
        items: action.payload,
        totalElements: action.totalElements,
        errorMessage: action.error,
      }
    case 'IMPORT_SUCCESS':
      return {
        ...state,
        loading: false,
        errorMessage: action.error,
      }
    case 'IMPORT_FAILURE':
      return {
        ...state,
        loading: false,
        errorMessage: action.error,
      }
    case 'SET_API':
      return {
        ...state,
        apiURL: action.apiURL,
      }
    case 'SET_TYPE_SEARCH':
      return {
        ...state,
        searchType: action.searchType,
        filter: action.searchType === 'Concept' ? ',concept.isCollection:!true' : '',
        importTo: action.importTo === 'Agent' ? 'Actor' : action.importTo,
      }
    case 'SET_IMPORT_TYPE':
      return {
        ...state,
        importTo: action.importTo,
      }
    case 'SET_FROM_COLLECTION':
      return {
        ...state,
        fromCollection: action.fromCollection === true ? '94df5ca7-5407-4396-bfce-b678b1684a72' : '',
      }
    default:
      return { ...state }
  }
}
