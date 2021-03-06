import {Entity, PrimaryGeneratedColumn, Unique, ManyToOne, Column, JoinColumn} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";
// import { Account } from "./account.entity";
import { Company } from "./company";
import { User } from "./user.entity";

@Entity()
@Unique(["number"])
export class AccountBlacklist {
    @ApiProperty()
    @PrimaryGeneratedColumn({name: 'acbl_id'})
    id: number;
    @ApiProperty()
    @Column({name: "acbl_uuid", nullable: true})
    uuid: string;
    @ApiProperty()
    // @Column({name: "account_id"})
    // accountId: number;
    @Column({name: "company_id"})
    companyId: number;
    @ApiProperty()
    @Column({name: "user_id", nullable: true})
    userId: number;
    @ApiProperty()
    @Column({name: "reason", nullable: true})
    reason: string;
    @ApiProperty()
    @Column({name: "number"})
    number: string;
    @ApiProperty()
    @Column({name: "company_uuid", nullable: true})
    companyUuid: string;
    @ApiProperty()
    @Column({name: "status", nullable: true})
    status: boolean;
    @ApiProperty()
    @Column({name: "other_detail", nullable: true})
    otherDetail: string;

    // @ApiProperty({ type: () => Account })
    // @ManyToOne(type => Account, account => account.blacklists)
    // @JoinColumn({ name: "account_id" })
    // account: Account;

    @ApiProperty({ type: () => Company })
    @ManyToOne(type => Company, company => company.blacklists)
    @JoinColumn({ name: "company_id" })
    company: Company;

    @ApiProperty({ type: () => User })
    @ManyToOne(type => User, user => user.blacklists)
    @JoinColumn({ name: "user_id" })
    user: User;
}
