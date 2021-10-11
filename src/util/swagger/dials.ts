import {ApiProperty} from '@nestjs/swagger';

export class DialsPost {
    @ApiProperty()
    numbers: number;
    @ApiProperty()
    nextStepRange: number;
    @ApiProperty()
    preventVoiceMails: boolean;
    @ApiProperty()
    areaCode: number;
}

export class DialsDelete {
    @ApiProperty()
    dialsID: number;
}

export class DialsPatch {
    @ApiProperty()
    dialsID: number;
    @ApiProperty()
    numbers: number;
    @ApiProperty()
    nextStepRange: number;
    @ApiProperty()
    preventVoiceMails: boolean;
    @ApiProperty()
    areaCode: number;
}