export class ResponsePaginateDto<T> {
  data: T[];
  size: number;
  page: number;
  total: number;
  totalPage: number;
  totalInPage: number;

  constructor(partial: Partial<ResponsePaginateDto<T>>) {
    Object.assign(this, partial);
  }
}
