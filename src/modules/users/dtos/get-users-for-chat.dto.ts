import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

export class GetUsersForChatDto extends PaginateDto {
  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  isAdmin: boolean = false;

  @ApiPropertyOptional({
    description: 'Search by user fullname or email',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
