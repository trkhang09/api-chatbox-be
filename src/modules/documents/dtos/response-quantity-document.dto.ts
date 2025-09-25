import { ApiProperty } from '@nestjs/swagger';

export class ResponseQuantityDocumentDto {
  @ApiProperty({
    description: 'Month of the year (1 = January, 12 = December)',
    example: 5,
  })
  month: number;

  @ApiProperty({
    description: 'Number of documents pending in this month',
    example: 12,
  })
  pending: number;

  @ApiProperty({
    description: 'Number of documents progressing in this month',
    example: 8,
  })
  progressing: number;

  @ApiProperty({
    description: 'Number of documents done in this month',
    example: 20,
  })
  done: number;

  constructor(month: number) {
    this.pending = 0;
    this.progressing = 0;
    this.done = 0;
    this.month = month;
  }
}
