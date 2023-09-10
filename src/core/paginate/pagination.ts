import {
  PaginationMeta,
  PaginationResultInterface,
} from './pagination.results.interface';

export class Pagination<PaginationEntity> {
  public results: PaginationEntity[];
  public meta: PaginationMeta;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.meta = {
      lastPage: paginationResults.meta.lastPage,
      currentPage: paginationResults.meta.currentPage,
      total: paginationResults.meta.total,
      perPage: paginationResults.meta.perPage,
      next: paginationResults.meta.next,
      previous: paginationResults.meta.previous,
    };
  }
}
