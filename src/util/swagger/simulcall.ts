import {ApiProperty} from '@nestjs/swagger';

export class SimulcallPost {
    @ApiProperty()
    numbers: number;
    @ApiProperty()
    ringInSequence: boolean;
    @ApiProperty()
    ringAllAtOnce: boolean;
    @ApiProperty()
    preventVoicemails: boolean;
    @ApiProperty()
    answerRange: number;
    @ApiProperty()
    routePreviousCallers: boolean;
}

export class SimulcallDelete {
    @ApiProperty()
    id: number;
}

export class SimulcallPatch {
    @ApiProperty()
    id: number;
    @ApiProperty()
    numbers: number;
    @ApiProperty()
    ringInSequence: boolean;
    @ApiProperty()
    ringAllAtOnce: boolean;
    @ApiProperty()
    preventVoicemails: boolean;
    @ApiProperty()
    answerRange: number;
    @ApiProperty()
    routePreviousCallers: boolean;
}