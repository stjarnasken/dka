import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { ApiResult, QueryType } from "../model/git-search.model";
import { filteredRepos, filteredUsers } from "../test-helpers/api.test-helper";
import { ApiService } from "./api.service";
import { DataService } from "./data.service";

const fullfilter = 'aaa';
const noResultsFilter = 'bbb';
const partialFilter = '100';
const maxResults = 50;

describe('DataService', () => {

  class ApiServiceStub {
    getRepos() {};
    getUsers() {};
  }
  
  let dataService: DataService;
  let apiServiceStub: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DataService,
        { provide: ApiService, useClass: ApiServiceStub },
      ],
    });
    dataService = TestBed.inject(DataService);
    apiServiceStub = TestBed.inject(ApiService);
  });
  
  it('dataService should be created', () => {
    expect(dataService).toBeTruthy();
  });

  it('search for full filter and 0 failed requests gets full sorted result with success status', (done) => {
    let apiResult: ApiResult;
    spyOn(apiServiceStub, 'getRepos').and.returnValue(of(filteredRepos(fullfilter)));
    spyOn(apiServiceStub, 'getUsers').and.returnValue(of(filteredUsers(fullfilter)));    
    dataService.getDataFromApi(fullfilter, maxResults).subscribe((result) => {
      apiResult = result;
      expect(apiResult.noErrors).toEqual(true);
      expect(apiResult.searchResults.length).toEqual(200);
      expect(apiResult.searchResults[0].searchHit).toEqual('aaa100repo');
      expect(apiResult.searchResults[0].queryType).toEqual(QueryType.Repo);
      expect(apiResult.searchResults[1].searchHit).toEqual('aaa100user');      
      expect(apiResult.searchResults[1].queryType).toEqual(QueryType.User);
    });
    done();
  });

  it('search for partial filter and 0 failed requests gets partial sorted result with success status', (done) => {
    let apiResult: ApiResult;
    spyOn(apiServiceStub, 'getRepos').and.returnValue(of(filteredRepos(partialFilter)));
    spyOn(apiServiceStub, 'getUsers').and.returnValue(of(filteredUsers(partialFilter)));    
    dataService.getDataFromApi(partialFilter, maxResults).subscribe((result) => {
      apiResult = result;
      expect(apiResult.noErrors).toEqual(true);
      expect(apiResult.searchResults.length).toEqual(2);
      expect(apiResult.searchResults[0].searchHit).toEqual('aaa100repo');
      expect(apiResult.searchResults[0].queryType).toEqual(QueryType.Repo);
      expect(apiResult.searchResults[1].searchHit).toEqual('aaa100user');
      expect(apiResult.searchResults[1].queryType).toEqual(QueryType.User);
    });
    done();
  });

  it('search for no results filter and 0 failed requests gets empty result with success status', (done) => {
    let apiResult: ApiResult;
    spyOn(apiServiceStub, 'getRepos').and.returnValue(of(filteredRepos(noResultsFilter)));
    spyOn(apiServiceStub, 'getUsers').and.returnValue(of(filteredUsers(noResultsFilter)));  
    dataService.getDataFromApi(noResultsFilter, maxResults).subscribe((result) => {
      apiResult = result;
      expect(apiResult.noErrors).toEqual(true);
      expect(apiResult.searchResults.length).toEqual(0);
    });
    done();
  });

  it('search for full filter and 1 failed request gets partial sorted result with success status', (done) => {
    let apiResult: ApiResult;
    spyOn(apiServiceStub, 'getRepos').and.returnValue(throwError({}));
    spyOn(apiServiceStub, 'getUsers').and.returnValue(of(filteredUsers(fullfilter)));    
    dataService.getDataFromApi(fullfilter, maxResults).subscribe((result) => {
      apiResult = result;
      expect(apiResult.noErrors).toEqual(true);
      expect(apiResult.searchResults.length).toEqual(100);
      expect(apiResult.searchResults[0].searchHit).toEqual('aaa100user');
      expect(apiResult.searchResults[0].queryType).toEqual(QueryType.User);
      expect(apiResult.searchResults[1].searchHit).toEqual('aaa10user');
      expect(apiResult.searchResults[1].queryType).toEqual(QueryType.User);
    });
    done();
  });

  it('search for known success data and 2 failed requests gets empty error result', (done) => {
    let apiResult: ApiResult;
    spyOn(apiServiceStub, 'getRepos').and.returnValue(throwError({}));
    spyOn(apiServiceStub, 'getUsers').and.returnValue(throwError({}));    
    dataService.getDataFromApi(fullfilter, maxResults).subscribe((result) => {
      apiResult = result;
      expect(apiResult.noErrors).toEqual(false);
      expect(apiResult.searchResults.length).toEqual(0);
    });
    done();
  });

});