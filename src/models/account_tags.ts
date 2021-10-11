import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";

import { User } from './user.entity'
import { Account } from './account.entity'
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

@Entity()
export class AccountTags {
    @PrimaryGeneratedColumn({ name: "acta_id" })
    id: number;

    @ApiProperty({ type: () => Account })
    @OneToOne(type => Account)
    @JoinColumn({ name: "acco_id" })
    account: Account;

    @ApiProperty({ type: () => User })
    @OneToOne(type => User)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Length(2, 30, {
        message: "incorrect:len(2,30)",
        always: true
    })
    @ApiProperty()
    @Column({ name: "acta_name" })
    name: string;

    @Length(3, 6, {
        message: "incorrect:len(2,30)",
        always: true
    })
    @ApiProperty()
    @Column({ name: "acta_color" })
    color: string;

    @ApiProperty()
    @Column({ name: "acta_bg_color" })
    backgroundColor: string;

}