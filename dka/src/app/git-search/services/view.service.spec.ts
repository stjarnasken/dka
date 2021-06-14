import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { concatMap } from "rxjs/operators";
import { SearchStatus } from "../model/git-search.model";
import { fakeEmptyApiFailureResult, fakeEmptyApiSuccessResult, fakeNonEmptyApiSuccessResult } from "../test-helpers/api.test-helper";
import { DataService } from "./data.service";
import { ViewService } from "./view.service";

describe('ViewService', () => {

  class DataServiceStub {
    getDataFromApi() {};
  }

  let viewService: ViewService;
  let dataServiceStub: DataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ViewService,
        { provide: DataService, useClass: DataServiceStub },
      ],
    });
    viewService = TestBed.inject(ViewService);
    dataServiceStub= TestBed.inject(DataService);
  });

  it('viewService should be created', () => {
    expect(viewService).toBeTruthy();
  });

  it('it should search on proper input', (done) => {
    const spy = spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeNonEmptyApiSuccessResult));
    viewService.receiveValueChanges({ searchInput: 'aaa' });
    const c = viewService.searchResults$.subscribe(result => {
      console.log('searchResults', result);
      expect(result.length).toEqual(1);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
      c.unsubscribe();
    });
  });

  it('it should not search on too short input', (done) => {
    const spy = spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeNonEmptyApiSuccessResult));
    viewService.receiveValueChanges({ searchInput: 'aa' });
    setTimeout(() => {
      const c = viewService.searchResults$.subscribe(result => {
        console.log('searchResults', result);
        expect(result.length).toEqual(1);
        done();
        c.unsubscribe();
      });
      expect(spy).toHaveBeenCalledTimes(0);
      done();
      c.unsubscribe();
    }, 4000)
  });

  it('it should show searching... on typing', (done) => {
    spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeNonEmptyApiSuccessResult));
    viewService.receiveValueChanges({ searchInput: 'aaa' });
    const c = viewService.status$.subscribe(result => {
      console.log('status', result);
      expect(result).toEqual(SearchStatus.Searching);
      done();
      c.unsubscribe();
    });
  });

  it('it should show no results... on empty result', (done) => {
    const spy = spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeEmptyApiSuccessResult));
    viewService.receiveValueChanges({ searchInput: 'aaa' });
    const c = viewService.searchResults$.pipe(
      concatMap(() => viewService.status$)
    ).subscribe(result => {
      console.log('status', result);
      expect(result).toEqual(SearchStatus.NoResults);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
      c.unsubscribe();
    });
  });

  it('it should show empty string on success result', (done) => {
    const spy = spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeNonEmptyApiSuccessResult));
    viewService.receiveValueChanges({ searchInput: 'aaa' });
    const c = viewService.searchResults$.pipe(
      concatMap(() => viewService.status$)
    ).subscribe(result => {
      console.log('status', result);
      expect(result).toEqual(SearchStatus.Results);
      expect(spy).toHaveBeenCalledTimes(1);
      done();
      c.unsubscribe();
    });
  });

  it('it should show error string on error result', (done) => {
    spyOn(dataServiceStub, 'getDataFromApi').and.returnValue(of(fakeEmptyApiFailureResult));
    viewService.receiveValueChanges({ searchInput: 'aaa' });
    const c = viewService.searchResults$.pipe(
      concatMap(() => viewService.status$)
    ).subscribe(result => {
      console.log('status', result);
      expect(result).toEqual(SearchStatus.Error);
      done();
      c.unsubscribe();
    });
  });

});
