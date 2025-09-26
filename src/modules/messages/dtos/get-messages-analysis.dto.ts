import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MessagesAnalysisType } from 'src/common/enums/messages-analysis-type.enum';

export class GetMessagesAnalysisDto {
  @ApiProperty({
    description: 'The type of analysis to perform (month or day)',
    example: MessagesAnalysisType.D_MONDAY,
    enum: MessagesAnalysisType,
  })
  @IsEnum(MessagesAnalysisType)
  time: MessagesAnalysisType;
}
