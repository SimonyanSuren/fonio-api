import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { UserTypes } from "./user.entity";

@Entity('invitations')
export class Invitation extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "invitation_id" })
    @ApiProperty()
    id: number;

    @Column({ name: "first_name" })
    @ApiProperty()
    firstName: string;

    @ApiProperty()
    @Column({ name: "last_name" })
    lastName: string;

    @ApiProperty()
    @Column({ name: "company_uuid" })
    companyUuid: string;

    @ApiProperty()
    @Column({ name: "invitation_uuid" })
    uuid: string;

    @ApiProperty()
    @Column("enum", { enum: UserTypes, default:UserTypes.COMPANY_USER })
    type: UserTypes;
}