import {ApiProperty} from "@nestjs/swagger";
import { IdentityId } from './identity_id'

export class CompanySummaryReq {
    @ApiProperty()
    frequency: IdentityId;
    @ApiProperty({isArray: true})
    emailContent: IdentityId[];
    @ApiProperty()
    company: IdentityId;
    @ApiProperty({isArray: true})
    users: IdentityId[];
}