import { Data } from '../../models'
import { ApiProperty } from '@nestjs/swagger';

export class TagRes {
    @ApiProperty()
    id: number;
    @ApiProperty()
    name: string;
}