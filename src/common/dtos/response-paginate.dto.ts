import { ApiProperty } from '@nestjs/swagger';

export class ResponsePaginateDto<T> {
  @ApiProperty({
    description: 'Array of data items for the current page',
  })
  data: T[];

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  size: number;

  @ApiProperty({
    description: 'Current page number (starting from 1)',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Total number of records',
    example: 135,
  })
  total: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 7,
  })
  totalPage: number;

  @ApiProperty({
    description: 'Number of records returned in this page',
    example: 20,
  })
  totalInPage: number;

  constructor(partial: Partial<ResponsePaginateDto<T>>) {
    Object.assign(this, partial);
  }
}
