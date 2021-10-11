import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from "typeorm";

import { User } from './user.entity';
import { CallFlow } from './call_flow.entity';
import { Data } from './data';
import { ApiProperty } from '@nestjs/swagger';
import { Recording } from "./recording";

@Entity("call_flow_steps")
export class CallFlowStep {
    @PrimaryGeneratedColumn({ name: "cafs_id" })
    id: number;

    @ApiProperty({ type: () => User })
    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ApiProperty({ type: () => Data })
    @ManyToOne(type => Data)
    @JoinColumn({ name: "cafs_type"})
    type: Data;

    @ApiProperty()
    @Column({ name: "cafs_dial_number_type", nullable: true})
    dialNumberType: string;

    @ApiProperty()
    @CreateDateColumn({ name: "cafs_created", type: 'timestamp' })
    created: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: "cafs_updated", type: 'timestamp' })
    updated: Date;

    @ApiProperty()
    @Column({ name: "cafs_uniqueid", nullable: true })
    uniqueId: string;

    @ApiProperty()
    @Column({ name: "cafs_record_message", nullable: true })
    recordMessage: string;

    @ApiProperty()
    @Column({ name: "cafs_dial_number", nullable: true })
    dialNumber: string;

    @ApiProperty()
    @Column({ name: "cafs_order", nullable: true })
    order: number;

    @ApiProperty()
    @Column({ name: "cafs_timeout", nullable: true })
    timeout: number;

    @ApiProperty()
    @Column({ name: "cafs_record_url", nullable: true })
    recordURL: string;

    @ApiProperty()
    @Column({ name: "cafs_simullcall_all", nullable: true })
    simullcallAll: boolean;

    @ApiProperty()
    @Column("jsonb", { name: "cafs_simullcall_numbers", nullable: true })
    simullCallNumbers?: any;

    @ApiProperty()
    @Column({ name: "cafs_simullcall_last_number", nullable: true })
    simullcallLastNumber: boolean;

    @ApiProperty()
    @Column("jsonb", { name: "cafs_menu_keys", nullable: true })
    menuKeys?: any;

    @ApiProperty()
    @Column("jsonb", { name: "cafs_schedule_hours", nullable: true })
    scheduleHours?: any;

    @ApiProperty()
    @Column({ name: "cafs_georouting_zip", nullable: true })
    georoutingZip: boolean;

    @ApiProperty()
    @Column("jsonb", { name: "cafs_georouting_config" , nullable: true})
    georoutingConfig?: any;

    @ApiProperty()
    @Column("jsonb", { name: "cafs_tags", nullable: true })
    tags?: any;

    @ApiProperty()
    @Column({ name: "cafs_voicemail_transcribe", nullable: true })
    voicemailTranscribe: boolean;

    @ApiProperty()
    @Column({ name: "cafs_amd", nullable: true })
    amd: boolean;

    @ApiProperty({ type: () => CallFlow })
    @ManyToOne(type => CallFlow, {onDelete: 'CASCADE'})
    @JoinColumn({ name: "cafl_id"})
    callFlow: CallFlow;

    @ApiProperty({ type: () => Recording })
    @OneToOne(type => Recording)
    @JoinColumn({ name: "reco_id" })
    recording: Recording;
}
