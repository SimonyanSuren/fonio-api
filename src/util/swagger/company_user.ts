import { ApiProperty } from '@nestjs/swagger';

export class CompanyUser {
    @ApiProperty()
    compId: number;
    @ApiProperty()
    userId: number;
}