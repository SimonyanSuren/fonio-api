import {ApiProperty} from '@nestjs/swagger';

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
    numbers: number;
    @ApiProperty()
    minutes: number;
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
    numbers: number;
    @ApiProperty()
    minutes: number;
    @ApiProperty()
    text: string;
}
