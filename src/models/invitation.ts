import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { UserTypes } from './user.entity';

@Entity('invitations')
export class Invitation extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'invitation_id' })
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsEmail()
  @Column({ name: 'email' })
  email: string;

  @ApiProperty()
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty()
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty()
  @Column({ name: 'company_uuid' })
  companyUuid: string;

  @ApiProperty()
  @Column({ name: 'invitation_uuid' })
  uuid: string;

  @ApiProperty()
  @Column('enum', { enum: UserTypes, default: UserTypes.COMPANY_USER })
  type: UserTypes;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_on' })
  createdOn: Date;

  @ApiProperty()
  @Column({
    name: 'expired_on',
	 type: 'timestamp',
	 nullable: true,
  })
  expiredOn: Date;

  @ApiProperty()
  @Column({ name: 'accepted_on', type: 'timestamp', nullable: true })
  acceptedOn?: Date;
}
