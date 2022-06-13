import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class InvitationReq {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  type: boolean;
}

export class AcceptInvitationReq {
  //  @IsOptional()
  //  @IsString()
  //  @IsNotEmpty()
  //  @ApiProperty()
  //  companyName: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsString()
  @ApiProperty()
  rePassword: string;
}

export class InvitationData {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  type: boolean;

  @ApiProperty()
  companyUuid: string;
}
