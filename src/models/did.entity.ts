import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Account } from "./account.entity";
import { User } from "./user.entity";
import { CallFlow } from "./call_flow.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Did {
    @ApiProperty()
    @PrimaryGeneratedColumn({ name: "did_id" })
    id: number;
    @ApiProperty()
    @Column({ name: "did_number" })
    number: string;
    @ApiProperty()
    @Column({ name: "number_name", nullable: true })
    numberName: string;
    @ApiProperty()
    @Column({ name: "did_status", default: false })
    status: boolean;
    @ApiProperty()
    @Column({ name: "did_opentact_id", nullable: true })
    didOpentactID?: string;
    @ApiProperty()
    @Column({ name: "acco_id" })
    accountID: number;
    @ApiProperty()
    @Column({ name: "user_id" })
    userID: number;
    @ApiProperty()
    @Column({ name: "did_opentact_identity_id", nullable: true })
    didOpentactIdentityID?: number;

    @UpdateDateColumn({ name: "updated_on", type: "timestamp" })
    updatedOn?: Date;
  
    @CreateDateColumn({ name: "created_on", type: "timestamp"  })
    createdOn?: Date;

    @ApiProperty()
    @Column({ name: "expire_on", type: "timestamp", nullable: true })
    expireOn?: Date;

    @ApiProperty({ type: () => Account })
    @ManyToOne(type => Account, account => account.did)
    @JoinColumn({ name: "acco_id" })
    account: Account;

    @ApiProperty()
    @Column({ name: "cf_id" , nullable: true})
    cfId: number;

    @ApiProperty({ type: () => CallFlow })
    @ManyToOne(type => CallFlow, callFlow => callFlow.did)
    @JoinColumn({ name: "cf_id" })
    callFlow: CallFlow;

    @ApiProperty({ type: () => User })
    @ManyToOne(type => User, user => user.did)
    @JoinColumn({ name: "user_id" })
    user: User;

    static withId(id: number): Did {
        let did = new Did();
        did.id = id;
        return did;
    }
}