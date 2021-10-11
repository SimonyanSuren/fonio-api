import { Data } from '../../models'
import { IdentityId } from './identity_id'
import { ApiProperty } from '@nestjs/swagger';

export class CallTranslateReq {
    @ApiProperty({ isArray: true })
    numbers: IdentityId[];

    @ApiProperty({ isArray: true })
    tags: IdentityId[];

    @ApiProperty()
    callType: IdentityId;

    @ApiProperty()
    callDuration: IdentityId;

    @ApiProperty()
    direction: IdentityId;

    @ApiProperty()
    rePassword: string;
}