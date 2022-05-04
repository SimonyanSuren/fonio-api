import {MigrationInterface, QueryRunner} from "typeorm";

export class setCompanyIdNullable1651694273721 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `invitations` CHANGE `company_uuid` `company_uuid` varchar(255) NULL');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `invitations` CHANGE `company_uuid` `company_uuid` varchar(255) NOT NULL');
    }

}
