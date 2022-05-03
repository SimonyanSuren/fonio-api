import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

@Entity('invitation_log')
export class InvitationLog extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'invitation_log_id' })
  @ApiProperty()
  id: number;

  @ApiProperty()
  @Column({ name: "company_uuid", nullable: true })
  companyUuid: string;

  @ApiProperty()
  @Column({ name: "invitation_uuid" })
  invitationUuid: string;

  @IsEmail()
  @ApiProperty()
  @Column({ name: "email" })
  email: string;

  @Column({ name: "first_name", nullable: true })
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  @Column({ name: "last_name", nullable: true })
  lastName: string;

  @ApiProperty()
  @Column({ type: 'timestamp without time zone', name: "created_on", default: Date.now() })
  createdAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp without time zone', name: "expired_on" })
  expiredAt: Date;

  @ApiProperty()
  @Column({ type: 'timestamp without time zone', name: "accepted_on" })
  acceptedOn: Date;
}
