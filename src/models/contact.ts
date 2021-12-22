import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Company } from "./company";
import { User } from "./user.entity";

@Entity("contacts")
export class Contact {
    @PrimaryGeneratedColumn({ name: "cont_id" })
    id: number;

    @ApiProperty()
    @Column({ name: "cont_phone_number" })
    phoneNumber: string;

    @Column({ name: "cont_first_name" })
    @ApiProperty()
    firstName: string;

    @Column({ name: "cont_last_name" })
    @ApiProperty()
    lastName: string;

    @Column({ name: "cont_email", nullable: true })
    @ApiProperty()
    email?: string;

    @Column({ name: "cont_created_on" })
    @ApiProperty()
    createdOn?: Date;

    @Column({ name: "cont_last_modified" })
    @ApiProperty()
    lastModified?: Date;

    @Column({name: "cont_active"})
    @ApiProperty()
    active: boolean;

    @ApiProperty()
    @Column({ name: "modified_by" })
    modifiedBy: number;

    @ApiProperty({ type: () => User, description: "USER" })
    @ManyToOne(type => User)
    @JoinColumn({ name: "assigned_to" })
    assignedTo: User;

    @ApiProperty({ type: () => Company, description: "COMPANY" })
    @ManyToOne(type => Company)
    @JoinColumn({ name: "comp_id" })
    company: Company;


    static withId(id: number): Contact {
        let cont = new Contact();
        cont.id = id;
        return cont;
    }
}
