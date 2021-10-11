import { ApiProperty } from "@nestjs/swagger";
import {Entity, PrimaryGeneratedColumn, JoinColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne} from "typeorm";
import { User } from "./user.entity";


@Entity("tokens")
export class Token {
   
    @PrimaryGeneratedColumn("uuid")
    token_uuid?: string;

    @Column({nullable: true })
    ha1: string;

    @Column( {nullable: true })
    ha1b: string;

    @UpdateDateColumn({type: "timestamp"})
    updated_on?: Date;

    @CreateDateColumn({type: "timestamp"})
    created_on?: Date;

    @ApiProperty({ type: () => User })
    @OneToOne(type => User,{ onDelete: 'CASCADE' })
    @JoinColumn({name: 'user_id'})
    user?: User;

}