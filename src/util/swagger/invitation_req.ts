import { ApiProperty } from '@nestjs/swagger';

export class InvitationReq {
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