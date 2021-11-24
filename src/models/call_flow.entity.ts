import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
// import { Account } from './account.entity';
import { User } from './user.entity';
import { CallFlowStep } from "./call_flow_step";
import { Did } from "./did.entity";
import { Company } from "./company";

@Entity()
export class CallFlow {
    @ApiProperty()
    @PrimaryGeneratedColumn({ name: "cafl_id" })
    id: number;
    
    @ApiProperty()
    @Column({ name: "cafl_name" })
    name: string;

    // @ApiProperty()
    // @Column({ name: "acco_id" })
    // accountId: string;

    @ApiProperty()
    @Column({ name: "company_id" })
    companyId: string;

    @ApiProperty()
    @CreateDateColumn({ name: "cafl_creation", type: 'timestamp' })
    creation: Date;

    @ApiProperty()
    @Column({ name: "cafl_status", default:false })
    status: boolean;

    @ApiProperty()
    @Column({ name: "cafl_record" })
    record: boolean;

    @Column( { nullable: true })
    xml?: string;

    @Column("jsonb", { name: "cafl_json", nullable: true })
    metadata?: any;
    steps: CallFlowStep[];

    @ApiProperty({ type: () => Did })
    @OneToMany(() => Did, did => did.callFlow)
    did: Did[];

    // @ApiProperty({ type: () => Account })
    // @ManyToOne(type => Account)
    // @JoinColumn({ name: "acco_id" })
    // account: Account;

    @ApiProperty({ type: () => Company })
    @ManyToOne(type => Company)
    @JoinColumn({ name: "company_id" })
    company: Company;

    @ApiProperty({ type: () => User })
    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

}