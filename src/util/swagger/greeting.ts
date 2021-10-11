import {ApiProperty} from '@nestjs/swagger';

export class GreetingPost {
    @ApiProperty()
    type: number;
    @ApiProperty()
    text: string;
}

export class GreetingDelete {
    @ApiProperty()
    greetingID: number;
}

export class GreetingPatch {
    @ApiProperty()
    greetingID: number;
    @ApiProperty()
    type: number;
    @ApiProperty()
    text: string;
}
