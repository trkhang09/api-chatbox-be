import { BadRequestException } from '@nestjs/common';
import { isNumber } from 'class-validator';

export function validateDashboardRequest(
  payload: { status?: string | number; days?: string | number },
  EnumType: Record<string, number | string>,
  canGetAllStatus: boolean = false,
) {
  let { status, days } = payload;
  if (!canGetAllStatus && status === undefined) {
    throw new BadRequestException('Status is required');
  }
  if (days === undefined) {
    throw new BadRequestException('Days is required');
  }

  status = parseInt(status + '');
  if (!canGetAllStatus && isNaN(status)) {
    throw new BadRequestException('Status is not a number');
  }

  days = parseInt(days + '');
  if (isNaN(days)) {
    throw new BadRequestException('Days is not a number');
  }

  const values = Object.values(EnumType).filter((v) => isNumber(v));

  if (!canGetAllStatus) {
    if (typeof status !== 'number' || !values.includes(status)) {
      throw new BadRequestException(
        `Invalid status. Must be one of: ${values.join(', ')}`,
      );
    }
  }

  if (typeof days !== 'number' || days <= 0 || days > 90) {
    throw new BadRequestException(
      `Invalid days. Must be a number between 1 and 90.`,
    );
  }

  return {
    status,
    days,
  };
}
