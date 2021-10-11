import {Entity, Column, BaseEntity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Company extends BaseEntity {
    @PrimaryGeneratedColumn({name: 'comp_id'})
    companyID: number;
    @Column({name: "user_creator"})
    userCreatorID: number;
    @Column({name: "comp_name"})
    companyName: string;
    @Column({name: "acco_id"})
    accountID: number;
    @Column({name: "comp_uuid"})
    companyUuid: string;
    @Column({name: "status"})
    status: boolean;
    @Column({name: "balance"})
    balance: number;
    @Column({name: "created"})
    created: Date;
    @Column({name: "identity_uuid", nullable: true})
    identityUuid: string;
    @Column({name: "user_uuid"})
    userUuid?: string;
    @Column({name: "timezone", nullable: true})
    timezone: string;

    static withId(id: number): Company {
        let comp = new Company();
        comp.companyID = id;
        return comp;
    }
}