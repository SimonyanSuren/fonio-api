import { ApiProperty } from '@nestjs/swagger';
import { CallFlowStep } from '../../models/call_flow_step';

export class CallFlowReq {
    @ApiProperty()
    name: string;

    // @ApiProperty()
    // did: number;

    @ApiProperty()
    didNumbers: string[];

    @ApiProperty()
    record: boolean;

    @ApiProperty({ isArray: true, type: CallFlowStep })
    steps: CallFlowStep[];
}