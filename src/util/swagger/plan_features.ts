import {ApiProperty} from '@nestjs/swagger';
import { PlanNumberTypes } from '../../models/plan.constant.entity';

export class PatchPlan {
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

export class DeleteUserByAdmin {
    @ApiProperty()
    userUuid: string;
}

// export class AssignPlanToCompany {
//     @ApiProperty()
//     planID: number;
//     @ApiProperty()
//     companyUuid: string;
// }

export class UpdatePlanStatus {
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
