import { Injectable } from "@angular/core";
import { forkJoin, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ApiResult, QueryType, SearchRequestInput, SearchResult } from "../model/git-search.model";
import { ApiService } from "./api.service";

@Injectable()
export class DataService {

  constructor(private apiService: ApiService) {}

  getDataFromApi(filter: string, maxResults: number): Observable<ApiResult>{
    const searchRequestInput = this.prepareSearchRequestInput(filter, maxResults);
    const queries: Observable<ApiResult>[] = [];
    const reposQuery = this.getReposQuery(searchRequestInput);
    const usersQuery = this.getUsersQuery(searchRequestInput);
    queries.push(reposQuery);
    queries.push(usersQuery);
    const combinedQueries = forkJoin(queries);
    return combinedQueries
    .pipe(
      map(apiResults => this.combineApiResults(apiResults))
    );
  }

  private getReposQuery(searchRequestInput: SearchRequestInput): Observable<ApiResult> {
    const reposQuery = this.apiService.getRepos(searchRequestInput)
    .pipe(
      map((response: { items: any[] }) => 
        response.items.map((i: { full_name: string; }) => i.full_name).map(
          (result: string) => this.mapToSearchResult(QueryType.Repo, result))),
      map(searchResults => this.mapToApiResult(true, searchResults)),
      catchError(() => {
        return of(this.mapToApiResult(false, []));
      })
    );
    return reposQuery;
  }

  private getUsersQuery(searchRequestInput: SearchRequestInput): Observable<ApiResult> {
    const usersQuery = this.apiService.getUsers(searchRequestInput)
    .pipe(
      map((response: { items: any[] }) => 
        response.items.map((i: { login: string; }) => i.login).map(
          (result: string) => this.mapToSearchResult(QueryType.User, result))),
      map(searchResults => this.mapToApiResult(true, searchResults)),  
      catchError(() => {      
        return of(this.mapToApiResult(false, []));
      })
    );
    return usersQuery;
  }

  private prepareSearchRequestInput(filter: string, maxResults: number): SearchRequestInput {
    const searchRequestInput: SearchRequestInput = {
      searchString: filter,
      pageNo: 1,
      perPage: maxResults
    };
    return searchRequestInput;
  }

  private mapToSearchResult(queryType: QueryType, searchHit: string): SearchResult {
    const searchResult: SearchResult = {
      queryType: queryType,
      searchHit: searchHit
    };
    return searchResult;
  }

  private mapToApiResult(noErrors: boolean, searchResults: SearchResult[]): ApiResult {
    const apiResult: ApiResult = {
      noErrors: noErrors,
      searchResults: searchResults
    };
    return apiResult;
  }

  private combineApiResults(apiResults: ApiResult[]): ApiResult {
    const apiResult: ApiResult = {
      noErrors: apiResults.some(result => result.noErrors),
      searchResults: apiResults.map(r => r.searchResults)
        .reduce((previous, current) => previous.concat(current))
        .sort(this.compareByPropertyNameAscending<string>('searchHit')),
    };
    return apiResult;
  }

  private compareByPropertyNameAscending<T extends string>(propertyName: string):
    (a: { [x: string]: any; }, b: { [x: string]: any; }) => number {
    return (a: { [x: string]: T; }, b: { [x: string]: T; }) => {
      if (a[propertyName].toUpperCase() > b[propertyName].toUpperCase()) {
        return 1;
      } else if (a[propertyName].toUpperCase() < b[propertyName].toUpperCase()) {
        return -1;
      }
      return 0;
    };
  }

}
