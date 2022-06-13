import { ApiProperty } from '@nestjs/swagger';
import { OrderDid } from './order_did';
import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class SignupReq {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  rePassword: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty()
  @IsOptional()
  userPhone: string;

}

export class CompanyMember {
	@ApiProperty()
	@IsEmail()
	email: string;
 
	@ApiProperty()
	@IsString()
	password: string;
 
	@ApiProperty()
	@IsString()
	rePassword: string;
 
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	firstName: string;
 
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	lastName: string;
 
	@ApiProperty()
	@IsOptional()
	userPhone: string; 
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
