import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleRequestDto } from './create-role-request.dto';
import { IsOptional } from 'class-validator';

export class UpdateRoleRequestDto extends PartialType(CreateRoleRequestDto) {
  @ApiProperty({
    example: 1,
    description: 'Status of the role (1: active, 0: inactive)',
  })
  @IsOptional()
  status?: number;
}
