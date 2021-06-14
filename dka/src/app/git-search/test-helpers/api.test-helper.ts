import { ApiResult, QueryType } from "../model/git-search.model";

const baseItem = 'aaa';

function getFakeUsers(): any[] {
  const logins: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const login = {
      login: baseItem + i.toString() + 'user'
    };
    logins.push(login);
  }
  return logins;
}

function getFakeRepos(): any[] {
  const repos: any[] = [];
  for (let i = 1; i <= 100; i++) {
    const full_name = {
      full_name: baseItem + i.toString() + 'repo'
    };
    repos.push(full_name);
  }
  return repos;
}

export const fakeUsers: any = {
  items: getFakeUsers()
};

export const fakeRepos: any = {
  items: getFakeRepos()
};

export function filteredUsers(filter: string): any {
  const items = getFakeUsers().filter(u => u.login.toString().includes(filter));
  return  {
    items: items
  };
};

export function filteredRepos(filter: string): any {
  const items = getFakeRepos().filter(r => r.full_name.toString().includes(filter));
  return  {
    items: items
  };
};

export const fakeEmptyApiSuccessResult: ApiResult = {
  noErrors: true,
  searchResults: []
};

export const fakeNonEmptyApiSuccessResult: ApiResult = {
  noErrors: true,
  searchResults: [
    {
      queryType: QueryType.Repo,
      searchHit: 'R1'
    }
  ]
};

export const fakeEmptyApiFailureResult: ApiResult = {
  noErrors: false,
  searchResults: []
};