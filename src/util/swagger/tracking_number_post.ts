import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsString,
  ValidateNested,
  ValidateIf,
  Max,
  Min,
  IsPositive,
  IsIn,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TrackingNumber {
  @ApiProperty()
  didID: string;
  @ApiProperty()
  companyUuid: string;
  @ApiProperty()
  planID: number;
  @ApiProperty()
  recordCalls: string;
  @ApiProperty()
  whisperMessage: string;
  @ApiProperty()
  recordCallsBoolean: boolean;
  @ApiProperty()
  whisperMessageBoolean: boolean;
  @ApiProperty()
  visitorFor: string;
  @ApiProperty()
  visitorFrom: string;
  @ApiProperty()
  alwaysSwap: boolean;
  @ApiProperty()
  direct: boolean;
  @ApiProperty()
  lendParams: boolean;
  @ApiProperty()
  lendPage: boolean;
  @ApiProperty()
  webRef: boolean;
  @ApiProperty()
  search: boolean;
  @ApiProperty()
  poolSize: number;
  @ApiProperty()
  destinationNumber: number;
  @ApiProperty()
  poolName: string;
  @ApiProperty()
  trackCampaign: boolean;
  @ApiProperty()
  trackEachVisitor: boolean;
  @ApiProperty()
  numberOnWebSite: boolean;
  @ApiProperty()
  numberOnline: boolean;
}

export class TrackingNumberPatch {
  @ApiProperty()
  callFlowID: number;
  @ApiProperty()
  id: number;
  @ApiProperty()
  didID: number;
  @ApiProperty()
  companyUuid: string;
  @ApiProperty()
  planID: number;
  @ApiProperty()
  recordCalls: string;
  @ApiProperty()
  whisperMessage: string;
  @ApiProperty()
  recordCallsBoolean: boolean;
  @ApiProperty()
  whisperMessageBoolean: boolean;
  @ApiProperty()
  visitorFor: string;
  @ApiProperty()
  visitorFrom: string;
  @ApiProperty()
  alwaysSwap: boolean;
  @ApiProperty()
  direct: boolean;
  @ApiProperty()
  lendParams: boolean;
  @ApiProperty()
  lendPage: boolean;
  @ApiProperty()
  webRef: boolean;
  @ApiProperty()
  search: boolean;
  @ApiProperty()
  poolSize: number;
  @ApiProperty()
  destinationNumber: number;
  @ApiProperty()
  poolName: string;
  @ApiProperty()
  trackCampaign: boolean;
  @ApiProperty()
  trackEachVisitor: boolean;
  @ApiProperty()
  numberOnWebSite: boolean;
  @ApiProperty()
  numberOnline: boolean;
  @ApiProperty()
  isTextMessaging: boolean;
}

export class TrackingNumberDelete {
  @ApiProperty()
  id: number;
}

export class DisableEnable {
  @ApiProperty()
  id: number;
  @ApiProperty()
  status: boolean;
}

export class NumberFeatures {
  @ApiProperty({
    enum: ['long_code', 'toll_free'],
    description:
      'Default: "long_code".The type of number. Must be "long_code" or "toll_free"',
  })
  type: string;

  @ApiProperty()
  country?: string;

  @ApiProperty({
    description: 'Two-letter state or province abbreviation (e.g. IL, CA)',
  })
  state?: string;

  @ApiProperty({
    description: 'Rate center name with general letters (e.g. SALMON)',
  })
  rateCenter?: string;

  @ApiProperty({ description: 'Default undefined. NPA ratecenter' })
  npa?: string;

  @ApiProperty({ description: 'Default undefined. NXX ratecenter' })
  nxx?: string;

  @ApiProperty({
    type: [String],
    description: 'Default voice and sms',
    default: ['voice', 'sms'],
  })
  features: string[];
}

export class TNOrderPriceResponse {
  @ApiProperty({
    description: 'price for corresponding number',
    example: { '12345678910': 10, sumOfPrices: 10 },
  })
  pricesResult: {};   
}

export class TNOrderItem {
  @IsPhoneNumber('US')
  @ApiProperty()
  tn: string;

  @IsArray()
  @ApiProperty({ type: ['String'], default: ['voice', 'sms'] })
  features: string[];
}

export class TNOrderPrice {
  @ApiProperty({ type: TNOrderItem, isArray: true })
  @ValidateNested({ each: true })
  @Type(() => TNOrderItem)
  @IsArray()
  items: TNOrderItem[];

  @ApiProperty({
    enum: ['month', 'year'],
    description: 'select month or year by need',
  })
  @IsIn(['month', 'year'])
  @IsString()
  durationUnit: string;

  @ApiProperty({example:1})
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  @Min(1)
  @Max(36)
  @ValidateIf((p) => p.durationUnit === 'month')
  duration: number;
}

export enum DurationTypes {
  year_duration = 'year',
  month_duration = 'month',
}
