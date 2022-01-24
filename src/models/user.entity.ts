import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn} from "typeorm";
// import {Plan} from "./plan.constant.entity";
// import {Account} from "./account.entity";
import {ApiProperty} from '@nestjs/swagger';

import {IsEmail} from "class-validator";
import { Payment } from "./payment.entity";
import { Did } from "./did.entity";
import { AccountBlacklist } from "./account_blacklist.entity";
import { Company } from "./company";

export enum UserTypes {
    COMPANY_ADMIN = "company_admin",
    COMPANY_USER = "company_user",
}

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn({name: "user_id"})
    id: number;

    @ApiProperty()
    @Column({name: "user_first_name"})
    firstName: string;

    @Column({name: "user_last_name"})
    @ApiProperty()
    lastName: string;
    @Column({name: "image_link", nullable: true})
    @ApiProperty()
    link?: string;

    @Column({name: "two_fa" , nullable: true})
    @ApiProperty()
    twoFA?: boolean;

    @Column("enum", { enum: UserTypes, default:UserTypes.COMPANY_USER })
    type: UserTypes;

    @Column({name: "user_company_name", nullable: true})
    @ApiProperty()
    companyName?: string;

    @Column({name: "user_phone", nullable: true})
    @ApiProperty()
    userPhone?: string;

    @IsEmail()
    @Column({name: "user_email"})
    @ApiProperty()
    email: string;

    @Column({ name: "sip_username", nullable: true })
    sipUsername?: string;

    @Column({name: "user_password"})
    password?: string;

    @Column({name: "user_salt"})
    salt?: string;

    @Column({name: "user_avatar", nullable: true})
    @ApiProperty()
    avatar?: string;

    @Column({type:'uuid', name: "user_uuid"})
    @ApiProperty()
    uuid?: string;

    @Column({name: "reset_password_hash", default: ''})
    resetPasswordHash?: string;

    @Column({name: "user_activation_hash", nullable: true})
    activationHash?: string;

    @CreateDateColumn({name: "user_creation", type: "timestamp"})
    @ApiProperty()
    creation?: Date;

    @Column({name: "user_activation_expire", type: "date", nullable: true})
    @ApiProperty()
    activationExpire?: Date;

    @UpdateDateColumn({name: "user_updated", type: "timestamp"})
    @ApiProperty()
    updated?: Date;

    @Column({name: "email_confirmed", default:false})
    @ApiProperty()
    emailConfirmed?: boolean;

    @Column({name: "user_active", default: false})
    @ApiProperty()
    active?: boolean;

    @Column({name: "user_last_login", nullable: true})
    @ApiProperty()
    userLastLogin?: Date;

    // @Column({name: "plan_id", nullable: true})
    // @ApiProperty()
    // planID?: number;

    @Column({name: "user_plain_text"})
    @ApiProperty()
    plaintText?: boolean;

    @Column({name: "is_admin", default:false})
    @ApiProperty()
    isAdmin?: boolean;

    @Column({name: "user_identity_opentact"})
    @ApiProperty()
    userIdentityOpenTact?: boolean;

    @Column({name: "user_invoice_email"})
    @ApiProperty()
    invoiceEmail?: boolean;

    @Column({type:'uuid', name: "company_uuid", nullable: true})
    @ApiProperty()
    companyUuid: string;

    // @Column({ name: "account_id" })
    // @ApiProperty()
    // accountID: number;

    @Column({ name: "company_id", nullable: true })
    @ApiProperty()
    companyID: number;

    @Column({name: "user_machine_detection", nullable: true})
    @ApiProperty()
    machineDetection?: boolean;

    @Column({name: "user_forward_softphone", nullable: true})
    forwardSoftphone?: boolean;

    @OneToMany(type => Payment, payments => payments.user)
    payments?: Payment[];

    // @ApiProperty({ type: () => Account })
    // @ManyToOne(type => Account,{ onDelete: 'CASCADE' })
    // @JoinColumn({name: 'account_id'})
    // account?: Account;

    @ApiProperty({ type: () => Company })
    @ManyToOne(type => Company,{ onDelete: 'CASCADE' })
    @JoinColumn({name: 'company_id'})
    company?: Company;

    @ApiProperty({ type: () => Did })
    @OneToMany(() => Did, did => did.user)
    @ApiProperty({ type: Did })
    did?: Did[];

    @ApiProperty({ type: () => AccountBlacklist })
    @OneToMany(type => AccountBlacklist, blacklists => blacklists.user)
    blacklists?: AccountBlacklist[];

    @ApiProperty({description: "TOKEN JWT"})
    token?: string;
    rePassword?: string;
    // plan?: Plan;
    numbers?: any;

    static withId(id: number): User {
        let us = new User();
        us.id = id;
        return us;
    }
}
