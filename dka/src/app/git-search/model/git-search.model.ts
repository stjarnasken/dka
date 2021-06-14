export enum QueryType {
  Repo = 1,
  User = 2
}

export enum SearchStatus {
  Searching = 'Searching...',
  Error = 'Search Error...',
  NoResults = 'No Results...',
  Results = ''
}

export interface SearchResult {
  queryType: QueryType;
  searchHit: string;
}

export interface SearchRequestInput {
  searchString: string;
  pageNo: number;
  perPage: number;
}

export interface ApiResult {
  noErrors: boolean;
  searchResults: SearchResult[];
}

export interface SearchConfigData {
  minSearchInput: number;
  maxResults: number;
  searchDebounce: number;
}
