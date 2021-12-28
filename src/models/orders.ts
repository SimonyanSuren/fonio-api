import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn({ name: "order_id" })
    id: number;

    @ApiProperty()
    @Column({ name: "order_uuid" })
    orderUuid: string;

    @Column({ name: "user_uuid" })
    @ApiProperty()
    userUuid: string;

    @Column({ name: "order_state" })
    @ApiProperty()
    state: string;

    @Column({ name: "order_done", default: false })
    @ApiProperty()
    done: boolean;
}