import {ApiProperty} from '@nestjs/swagger';
import { PlanNumberTypes } from '../../models/plan.constant.entity';

export class PatchPlan {
    @ApiProperty()
    id: number;
    @ApiProperty()
    monthlyAmount: number;
    @ApiProperty()
    annuallyAmount: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    text: string;
    @ApiProperty()
    status: boolean;
}

export class PatchPlanUser {
    @ApiProperty()
    id: number;
}

export class DeleteUserByAdmin {
    @ApiProperty()
    userUuid: string;
}

export class AssignPlanToCompany {
    @ApiProperty()
    planID: number;
    @ApiProperty()
    companyUuid: string;
}

export class UpdatePlanStatus {
    @ApiProperty()
    planID: number;
    @ApiProperty()
    status: boolean;
}

export class PlanPost {
    @ApiProperty()
    monthlyAmount: number;
    @ApiProperty()
    annuallyAmount: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    text: string;
    @ApiProperty()
    type: PlanNumberTypes;
}
