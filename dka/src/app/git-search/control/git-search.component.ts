import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { QueryType, SearchConfigData, SearchResult } from "../model/git-search.model";
import { ApiService } from "../services/api.service";
import { DataService } from "../services/data.service";
import { ViewService } from "../services/view.service";

@Component({
  selector: 'app-git-search',
  templateUrl: './git-search.component.html',
  styleUrls: ['./git-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ApiService, DataService, ViewService]
})
export class GitSearchComponent implements OnInit, OnDestroy {

  @Input() minSearchInput!: number;
  @Input() maxResults!: number;
  @Input() searchDebounce!: number;

  searchForm!: FormGroup;
  status$: Observable<string>;
  searchResults$: Observable<SearchResult[]>;

  private unSubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private viewService: ViewService) {
      this.status$ = this.viewService.status$;
      this.searchResults$ = this.viewService.searchResults$;
  }
  
  ngOnInit(): void {
    this.buildSearchForm();
    this.setStreams();
    this.passConfigDataToViewService();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  get QueryType() {
    return QueryType; 
  }
  
  displayWith(result: SearchResult): string {
    return result && result.searchHit ? result.searchHit : '';
  }

  onEnter(): void {
    const searchInputValue = this.searchForm.controls['searchInput'].value;
    this.viewService.redirectToGitHub(searchInputValue);
  }

  private buildSearchForm(): void {
    this.searchForm = this.formBuilder.group({
      searchInput: ['']
    });
  }
  
  private setStreams(): void {
    this.searchForm.valueChanges
    .pipe(
      takeUntil(this.unSubscribe$))
    .subscribe(
      valueChanges => this.viewService.receiveValueChanges(valueChanges)
    );
  }

  private passConfigDataToViewService(): void {
    const searchConfigData: SearchConfigData = {
      searchDebounce: this.searchDebounce,
      minSearchInput: this.minSearchInput,
      maxResults: this.maxResults
    }
    this.viewService.setSearchConfigData(searchConfigData);
  }

}
