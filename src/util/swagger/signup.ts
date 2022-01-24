import {ApiProperty} from '@nestjs/swagger';
import { OrderDid } from './order_did';


export class SignupReq {
    @ApiProperty()
    email: string;
    @ApiProperty()
    password: string;
    @ApiProperty()
    rePassword: string;
    @ApiProperty()
    firstName: string;
    @ApiProperty()
    lastName: string;
    @ApiProperty()
    companyName: string;
    @ApiProperty()
    userPhone: string;
    @ApiProperty()
    invitationUuid?: string;
}

export class CompanyMember {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  rePassword: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  userPhone: string;
  @ApiProperty()
  companyName: string;
}

export class CompanyMemberUpdate {
  @ApiProperty()
  phone: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  active: boolean;
}

export class CreatePaymentReq {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  rePassword: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  companyName: string;
  @ApiProperty({
      type: [OrderDid],
    })
  did_numbers?: OrderDid[];
}
