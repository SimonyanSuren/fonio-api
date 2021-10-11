import {ApiProperty} from '@nestjs/swagger';

export class CallFlowPost {
    @ApiProperty()
    greetingID: number;
    @ApiProperty()
    recordCalls: boolean;
    @ApiProperty()
    callFlowName: string;
}

export class CallFlowStatus {
    @ApiProperty()
    status: boolean;
}
