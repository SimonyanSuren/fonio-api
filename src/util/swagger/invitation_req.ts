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
}

export class InvitationData {
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    type: boolean;

    @ApiProperty()
    companyUuid: string;
}

export class InvitationLogData {
    @ApiProperty()
    email: string;

    @ApiProperty()
    invitationId: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    CreatedAt: Date;

    @ApiProperty()
    ExpiredAt: Date;

    @ApiProperty()
    AcceptedOn: Date;

    @ApiProperty()
    companyUuid: string;
}
