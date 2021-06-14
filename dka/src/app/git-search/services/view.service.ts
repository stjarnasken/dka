import { Injectable } from "@angular/core";
import { BehaviorSubject, merge, of } from "rxjs";
import { Observable } from "rxjs";
import { debounceTime, delay, exhaustMap, filter, map, mapTo, shareReplay } from "rxjs/operators";
import { ApiResult, SearchConfigData, SearchResult, SearchStatus } from "../model/git-search.model";
import { DataService } from "./data.service";

@Injectable()
export class ViewService {

  status$: Observable<string> = of('');
  searchResults$: Observable<SearchResult[]> = of([]);

  private emptyApiResult: ApiResult = {
    noErrors: true,
    searchResults: [],
  };

  private searchInput$: Observable<string> = of('');
  private apiResult$: Observable<ApiResult> = of(this.emptyApiResult);

  private searchDebounce: number = 750;
  private minSearchInput: number = 3;
  private maxResults: number = 50;

  searchInputValueChanges = new BehaviorSubject<any>('');
  private searchInputValueChanges$: Observable<any>;

  constructor(
    private dataService: DataService) {
      this.searchInputValueChanges$ = this.searchInputValueChanges.asObservable();
      this.setStreams();
  }

  receiveValueChanges(valueChanges: any): void {
    this.searchInputValueChanges.next(valueChanges);
  }

  setSearchConfigData(searchConfigData: SearchConfigData): void {
    this.searchDebounce = searchConfigData.searchDebounce;
    this.minSearchInput = searchConfigData.minSearchInput;
    this.maxResults = searchConfigData.maxResults;
  }

  redirectToGitHub(searchInputValue: any): void {
    if (typeof(searchInputValue) !== 'string') {
      this.openGitHub(searchInputValue);
    }
  }

  private openGitHub(searchInputValue: any): void {
    window.open(`https://github.com/${searchInputValue.searchHit}`, '_blank');
  }

  private setStreams(): void {
    
    this.searchInput$ = this.searchInputValueChanges$
    .pipe(
      debounceTime(this.searchDebounce),
      filter(valueChanges => typeof(valueChanges.searchInput) === 'string'),
      map(valueChanges => valueChanges.searchInput),
      filter(searchInput => searchInput.trim().length >= this.minSearchInput),
    );

    this.apiResult$ = this.searchInput$
    .pipe(
      delay(500), // NOTE: To display SEARCHING... message at least for a while
      exhaustMap(searchInput => this.dataService.getDataFromApi(searchInput.toLowerCase(), this.maxResults)),
      shareReplay(),
    );

    this.searchResults$ = this.apiResult$
    .pipe(
      map(apiResult => apiResult.searchResults)
    );

    this.status$ = merge(
      this.searchInput$
      .pipe(
        mapTo(SearchStatus.Searching)),
      this.apiResult$
      .pipe(
        map(result => {
          if (result.noErrors === false) {
            return SearchStatus.Error
          } else {
            if (result.searchResults.length === 0) {
              return SearchStatus.NoResults
            } else {
              return SearchStatus.Results
            }
          }
        })
      )
    );
  }

}
