import {ApiProperty} from '@nestjs/swagger';

export class MenuPost {
    @ApiProperty()
    type: number;
}

export class MenuDelete {
    @ApiProperty()
    id: number;
}

export class MenuPatch {
    @ApiProperty()
    id: number;
    @ApiProperty()
    type: number;
}