import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { SearchRequestInput } from "../model/git-search.model";

@Injectable()
export class ApiService {
  
  private gitHubSearchUrl = 'https://api.github.com/search/';

  constructor(private httpClient: HttpClient) {}

    getRepos(searchRequestInput: SearchRequestInput): Observable<any> {
      return this.httpClient.get(this.getReposUrl(searchRequestInput));
    }

    getUsers(searchRequestInput: SearchRequestInput): Observable<any> {
      return this.httpClient.get(this.getUsersUrl(searchRequestInput));
    }

    private getBaseSearchUrl(searchRequestInput: SearchRequestInput, path: string, property: string) {
      return `${this.gitHubSearchUrl}${path}?q=${searchRequestInput.searchString} `+
      `in:${property}&page=${searchRequestInput.pageNo}&per_page=${searchRequestInput.perPage}&order=asc`;
    }

    private getReposUrl(searchRequestInput: SearchRequestInput) {
      return this.getBaseSearchUrl(searchRequestInput, 'repositories', 'name');
    }

    private getUsersUrl(searchRequestInput: SearchRequestInput) {
      return this.getBaseSearchUrl(searchRequestInput, 'users', 'login');
    }
  
}
