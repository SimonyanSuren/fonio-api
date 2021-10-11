import {ApiProperty} from '@nestjs/swagger';

export class CompanyDID {
    @ApiProperty()
    name: string;
    @ApiProperty()
    timezone: string;
    @ApiProperty()
    id: number;
    @ApiProperty()
    status: boolean;
    @ApiProperty({description: "Count dids Company"})
    dids: number;
    @ApiProperty({description: "Count users Company"})
    users: number;
}
