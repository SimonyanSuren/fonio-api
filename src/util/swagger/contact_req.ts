import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean } from 'class-validator';

export class ContactReq {
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  phoneNumber: string;

  @IsString()
  @ApiProperty()
  firstName: string;

  @IsString()
  @ApiProperty()
  lastName: string;

  @IsBoolean()
  @ApiProperty()
  active: boolean;

  @IsBoolean()
  @ApiProperty()
  favourite: boolean;
}
