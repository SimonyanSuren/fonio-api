import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

export class IPlanCreateProps {
    name: string;
    monthlyAmount: number;
    annuallyAmount: number;
    numbers: number;
    minutes: number;
    order: number;
    text: string;
    status: boolean;
}

export interface IPlan extends IPlanCreateProps{
    id: number;
    creation?: Date;
    updatedOn?: Date;
}

export enum PlanNumberTypes {
    TOLL_FREE = 'toll_free',
    LONG_CODE = 'long_code'
}

@Entity()
export class Plan implements IPlan{
    @PrimaryGeneratedColumn({ name: "plan_id" })
    @ApiProperty()
    id: number;
    @Column({ name: "plan_name", nullable: true })
    @ApiProperty()
    name: string;
    @ApiProperty()
    @Column({ type: "float", name: "plan_monthly", nullable: true })
    monthlyAmount: number;
    @ApiProperty()
    @Column({ type: "float", name: "plan_annually", nullable: true })
    annuallyAmount: number;
    @ApiProperty()
    @Column({ name: "numbers", nullable: true })
    numbers: number;
    @ApiProperty()
    @Column({ name: "minutes", nullable: true })
    minutes: number;

    @ApiProperty()
    @Column({ name: "plan_order", nullable: true })
    order: number;
    @ApiProperty()
    @Column({ name: "text", nullable: true })
    text: string;
    @ApiProperty()
    @Column({ name: "plan_status", nullable: true })
    status: boolean;
    @ApiProperty()
    @Column("enum", { enum: PlanNumberTypes })
    type: PlanNumberTypes;

    @ApiProperty()
    @CreateDateColumn({ name: "plan_creation", type: "date" })
    creation?: Date;
    
    @ApiProperty()
    @UpdateDateColumn({name: "updated_on", type: "timestamp"})
    updatedOn?: Date;
}
