import {ApiProperty} from "@nestjs/swagger";
import { IdentityId } from './identity_id'

export class CallNotificationReq {
    @ApiProperty()
    interaction: IdentityId;
    @ApiProperty()
    company: IdentityId;
    @ApiProperty({isArray: true})
    numbers: IdentityId[];
    @ApiProperty({isArray: true})
    tags: IdentityId[];
    @ApiProperty({isArray: true})
    users: IdentityId[];
    @ApiProperty({isArray: true})
    types: IdentityId[];
}