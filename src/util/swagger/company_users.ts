import { ApiProperty } from '@nestjs/swagger';
import { IdentityId } from './identity_id';

export class CompanyUsers {

    @ApiProperty({ isArray: true })
    users: IdentityId[];
}
