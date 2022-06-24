import { Entity, Column, PrimaryGeneratedColumn, OneToOne, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Invoice } from './invoice'
import { User } from "./user.entity";


export enum PaymentSystems {
    PAYPAL = "paypal",
    STRIPE = "stripe"
}

@Entity('payment')
export class Payment {
    @ApiProperty()
    @PrimaryGeneratedColumn({ name: "pay_id" })
    id: number;

    @ApiProperty()
    @Column({ type: "float", name: "pay_amount" })
    amount: number;

    @ApiProperty()
    @Column({ type: "float", name: "pay_unit_amount" })
    unitAmount: number;

    @ApiProperty()
    @Column({ name: "pay_with", enum: PaymentSystems })
    payWith: PaymentSystems;

    @Column({ name: "transaction_id", nullable: false })
    transactionId: string;

    @Column({ default: false })
    success?: boolean;

    @CreateDateColumn({ name: "pay_on", type: 'timestamp' })
    @ApiHideProperty()
    payOn: Date;

    @ApiProperty()
    @Column({ name: "invo_id", nullable: true })
    invo_id?: number;

    @ApiProperty()
    @Column({ name: "user_id", nullable: false })
    userId: number;

    @ApiProperty()
    @Column({ name: "company_id", nullable: true })
    companyId: number;

    @ApiProperty()
    @Column({ name: "current_balance", nullable: true })
    currentBalance?: number;

    @ApiProperty()
    @Column({ name: "gateway", nullable: true })
    gateway?: string;

    @ApiProperty()
    @Column({ name: "transition", nullable: true })
    transition?: string;

    @Column("text", { array: true, nullable: true })
    didNumbers?: string[];

    @UpdateDateColumn({ name: "updated_on", type: "timestamp" })
    updatedOn?: Date;
    
    @ApiProperty()
    @Column({ name: "plan_id" })
    planId: number;

    @ApiProperty()
    @Column({ name: "duration" })
    duration: number;

    @ApiProperty()
    @Column({ name: "duration_unit" })
    durationUnit: string;

    @ApiProperty({ type: () => Invoice })
    @OneToOne(type => Invoice)
    @JoinColumn({ name: "invo_id" })
    invoice?: Invoice;

    @ApiProperty({ type: () => User })
    @ManyToOne(type => User, user => user.payments)
    @JoinColumn({ name: "user_id" })
    user: User;

    static withId(id: number): Payment {
        let ac = new Payment();
        ac.id = id;
        return ac;
    }
}
