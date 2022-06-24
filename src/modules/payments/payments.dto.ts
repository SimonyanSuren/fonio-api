import { ApiProperty } from '@nestjs/swagger';
import { PaymentSystems } from '../../models/payment.entity';
import { PlanNumberTypes } from '../../models/plan.constant.entity';
import { OrderDid } from '../../util/swagger/order_did';
import { IsMonthOrYear } from '../../util/validator/customDidNumberDuration.validator';
import {
  IsNumber,
  IsString,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUUID,
  IsIn,
  IsPositive,
  Min,
  Max,
} from 'class-validator';

export abstract class CreatePayment {
  @ApiProperty({ enum: PaymentSystems, default: PaymentSystems.STRIPE })
  @IsEnum(PaymentSystems)
  paymentType: PaymentSystems;
  @ApiProperty()
  @IsUUID()
  orderUuid: string;
  @ApiProperty({ enum: PlanNumberTypes, default: PlanNumberTypes.TOLL_FREE })
  @IsEnum(PlanNumberTypes)
  numberType: PlanNumberTypes;
  @ApiProperty()
  @IsNumber()
  planID: number;
  @ApiProperty({
    enum: ['month', 'year'],
    description: 'select month or year by need',
  })
  @IsIn(['month', 'year'])
  @IsString()
  durationUnit: string;

  @ApiProperty({ example: 1 })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  @Min(1)
  @Max(12)
  @IsMonthOrYear('durationUnit', {
    message: 'duration must not be greater than 1, if duration unit is year',
  })
  duration: number;
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
