import { ApiProperty } from "@nestjs/swagger";
import {Entity, Column, BaseEntity, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { Did } from "./did.entity";
import { AccountBlacklist } from "./account_blacklist.entity";


@Entity()
export class Company extends BaseEntity {
    @ApiProperty()
    @PrimaryGeneratedColumn({name: 'comp_id'})
    companyID: number;
    @ApiProperty()
    @Column({name: "user_creator"})
    userCreatorID: number;
    @ApiProperty()
    @Column({name: "comp_name"})
    companyName: string;
    // @Column({name: "acco_id"})
    // accountID: number;
    @ApiProperty()
    @Column({name: "comp_uuid"})
    companyUuid: string;
    @ApiProperty()
    @Column({name: "status"})
    status: boolean;
    @ApiProperty()
    @Column({name: "balance"})
    balance: number;
    @ApiProperty()
    @Column({name: "created"})
    created: Date;
    @ApiProperty()
    @Column({name: "identity_uuid", nullable: true})
    identityUuid: string;
    @ApiProperty()
    @Column({name: "user_uuid"})
    userUuid?: string;
    @ApiProperty()
    @Column({name: "timezone", nullable: true})
    timezone: string;
    @Column({name: "plan_id", nullable: true})
    @ApiProperty()
    planID?: number;

    @ApiProperty({ type: () => AccountBlacklist })
    @OneToMany(type => AccountBlacklist, blacklists => blacklists.company)
    blacklists?: AccountBlacklist[];

    @ApiProperty({ type: () => Did })
    @OneToMany(type => Did, did => did.company)
    did?: Did[];

    static withId(id: number): Company {
        let comp = new Company();
        comp.companyID = id;
        return comp;
    }
}