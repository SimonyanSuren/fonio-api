import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

import {ApiProperty} from '@nestjs/swagger';

@Entity()
export class PlanCompany {
    @PrimaryGeneratedColumn({name: "pc_id"})
    @ApiProperty()
    id: number;
    @Column({name: "user_id"})
    @ApiProperty()
    userID: number;
    @Column({name: "company_uuid"})
    @ApiProperty()
    companyUuid: string;
    @Column({name: "plan_id"})
    @ApiProperty()
    planID: number;
}
