import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from "./api.service";
import { SearchRequestInput } from "../model/git-search.model";
import { fakeUsers, fakeRepos } from "../test-helpers/api.test-helper";
import { HttpErrorResponse } from "@angular/common/http";

const searchRequestInput: SearchRequestInput = {
  searchString: 'aaa',
  pageNo: 1,
  perPage: 50
};

const expectedReposUrl = 'https://api.github.com/search/repositories?q=aaa in:name&page=1&per_page=50&order=asc';
const expectedUsersUrl = 'https://api.github.com/search/users?q=aaa in:login&page=1&per_page=50&order=asc';

describe('ApiService', () => {
  
  let apiService: ApiService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });
    apiService = TestBed.inject(ApiService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
  });

  it('apiService should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('searches for repos at right url with proper method and returns fake data', () => {
    let actualRepos: any[] | undefined;
    apiService.getRepos(searchRequestInput).subscribe((result) => {
      actualRepos = result.fakeRepos;
    });
    const call = backend.expectOne(expectedReposUrl);
    expect(call.request.method).toBe('GET');
    call.flush({ fakeRepos });
    expect(actualRepos).toEqual(fakeRepos);
  });

  it('searches for users at right url with proper method and returns fake data', () => {
    let actualUsers: any[] | undefined;
    apiService.getUsers(searchRequestInput).subscribe((result) => {
      actualUsers = result.fakeUsers;
    });
    const call = backend.expectOne(expectedUsersUrl)
    expect(call.request.method).toBe('GET');
    call.flush({ fakeUsers });
    expect(actualUsers).toEqual(fakeUsers);
  });

  it('passes errors for users', () => {
    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');
    let actualError: HttpErrorResponse | undefined;
    apiService.getUsers(searchRequestInput).subscribe(
      () => {
        fail('at next');
      },
      (error) => {
        actualError = error;
      },
      () => {
        fail('at complete');
      },
    );
    backend.expectOne(expectedUsersUrl).error(errorEvent, { status, statusText });
    if (!actualError) {
      throw new Error('Cannot be undefined!');
    }
    expect(actualError.error).toBe(errorEvent);
    expect(actualError.status).toBe(status);
    expect(actualError.statusText).toBe(statusText);
  });

  it('passes errors for repos', () => {
    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');
    let actualError: HttpErrorResponse | undefined;
    apiService.getRepos(searchRequestInput).subscribe(
      () => {
        fail('at next');
      },
      (error) => {
        actualError = error;
      },
      () => {
        fail('at complete');
      },
    );
    backend.expectOne(expectedReposUrl).error(errorEvent, { status, statusText });
    if (!actualError) {
      throw new Error('Cannot be undefined!');
    }
    expect(actualError.error).toBe(errorEvent);
    expect(actualError.status).toBe(status);
    expect(actualError.statusText).toBe(statusText);
  });

});
