import {ApiProperty} from '@nestjs/swagger';

export class HangupPost {
    @ApiProperty()
    text: string;
    @ApiProperty()
    isText: boolean;
}

export class HangupDelete {
    @ApiProperty()
    id: number;
}

export class HangupPatch {
    @ApiProperty()
    id: number;
    @ApiProperty()
    text: string;
    @ApiProperty()
    isText: boolean;
}