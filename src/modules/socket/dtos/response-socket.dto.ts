import { HttpStatus } from '@nestjs/common';

export class ResponseSocketDto<T> {
  code: HttpStatus;
  message: string;
  data: T;

  constructor(partial: Partial<ResponseSocketDto<T>>) {
    Object.assign(this, partial);
  }
}
