import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Data } from "./data";
// import { Account } from './account.entity';
import { Company } from './company';
import { ApiProperty } from '@nestjs/swagger';

import { IsEmail } from "class-validator";
import { User } from "./user.entity";

@Entity("recordings")
export class Recording {
    @PrimaryGeneratedColumn({ name: "reco_id" })
    id: number;

    @ApiProperty()
    @Column({ name: "reco_path" })
    path: string;

    @Column({ name: "reco_name" })
    @ApiProperty()
    name: string;

    @IsEmail()
    @Column({ name: "reco_url" })
    @ApiProperty()
    url: string;

    @Column({ name: "reco_creation", type: "date" })
    @ApiProperty()
    creation?: Date;

    @Column({ name: "reco_updated", type: "date" })
    @ApiProperty()
    updated?: Date;

    @ApiProperty({ type: () => Data, description: "TYPE USER" })
    @ManyToOne(type => Data)
    @JoinColumn({ name: "data_id", referencedColumnName: "id" })
    type: Data;

    // @ApiProperty({ type: () => Account, description: "ACCOUNT USER" })
    // @ManyToOne(type => Account)
    // @JoinColumn({ name: "acco_id" })
    // account: Account;

    @ApiProperty({ type: () => Company, description: "ACCOUNT USER" })
    @ManyToOne(type => Company)
    @JoinColumn({ name: "company_id" })
    company: Company;

    @ApiProperty({ type: () => User, description: "USER" })
    @ManyToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column("jsonb", { name: "reco_json" })
    metadata?: any;


    static withId(id: number): Recording {
        let us = new Recording();
        us.id = id;
        return us;
    }
}
