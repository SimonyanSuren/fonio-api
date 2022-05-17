import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class InvitationReq {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  type: boolean;

}

export class AcceptInvitationReq {
  @ApiProperty()
  password: string;
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
