import { ApiProperty } from '@nestjs/swagger';

export class ResponseMessagesAnalysisDto {
  @ApiProperty({
    description:
      'The time value (month number 1–12, or hour 0–23 depending on analysis type)',
    example: 5,
  })
  time: number;

  @ApiProperty({
    description: 'Number of AI messages during the given time period',
    example: 120,
  })
  aiMessagesCount: number;

  @ApiProperty({
    description: 'Number of user messages during the given time period',
    example: 200,
  })
  userMessagesCount: number;

  constructor(time: number) {
    this.time = time;
    this.aiMessagesCount = 0;
    this.userMessagesCount = 0;
  }
}
