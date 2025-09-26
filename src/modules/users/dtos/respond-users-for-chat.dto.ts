import { ResponsePaginateDto } from 'src/common/dtos/response-paginate.dto';

export class RespondUserForChatDto {
  id: string;
  email: string;
  fullname: string;
  status: number;
  role: string;
  createdAt: Date;
  chatId?: string;
}
