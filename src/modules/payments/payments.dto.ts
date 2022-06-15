import { ApiProperty } from '@nestjs/swagger';
import { PaymentSystems } from '../../models/payment.entity';
import { PlanNumberTypes } from '../../models/plan.constant.entity';
import { CreatePaymentReq } from '../../util/swagger';
import { OrderDid } from '../../util/swagger/order_did';
import { IsNumber, IsString, IsEnum, IsBoolean, IsArray } from 'class-validator';

export abstract class CreatePayment {
  @ApiProperty()
  amount?: number;
  @ApiProperty()
  paymentType: PaymentSystems;
  @ApiProperty()
  orderUuid: string;
  @ApiProperty()
  tempUuid: string;
  @ApiProperty()
  register: CreatePaymentReq;
  @ApiProperty()
  numberType: PlanNumberTypes;
  @ApiProperty()
  planID: number;
  @ApiProperty()
  duration: number;
  @ApiProperty()
  is_month: boolean;
}

export abstract class BuyDidNumbers {
  @ApiProperty()
  @IsNumber()
  amount?: number;

  @ApiProperty()
  @IsString()
  paymentType: PaymentSystems;

  @ApiProperty()
  @IsString()
  orderUuid: string;

  @ApiProperty({
    type: [OrderDid],
  })
  @IsArray()
  additionalNumbers?: OrderDid[];

  @ApiProperty()
  @IsEnum({ TOLL_FREE: 'toll_free', LONG_CODE: 'long_code' })
  numberType: PlanNumberTypes;

  @ApiProperty()
  @IsNumber()
  planID: number;

  @ApiProperty()
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsBoolean()
  is_month: boolean;
}
