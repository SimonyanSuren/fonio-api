import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsPhoneNumber,
  ValidateNested,
} from 'class-validator';

export class OrderDid {
  @ApiProperty({ default: '12345678910' })
  @IsPhoneNumber('US')
  tn: number;

  @IsArray()
  @ApiProperty({ type: ['String'], default: ['voice', 'sms'] })
  features: string[];

  @ApiProperty()
  @IsBoolean()
  autorenew: boolean;
}

export class OrderDids {
  @ApiProperty({
    type: [OrderDid],
  })
  @ApiProperty({ type: OrderDid, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => OrderDid)
  @IsArray()
  numbers: OrderDid[];
}
