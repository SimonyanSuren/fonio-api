import {MigrationInterface, QueryRunner} from "typeorm";

export class addParentCompanyUuid1638169988780 implements MigrationInterface {
    name = 'addParentCompanyUuid1638169988780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "parent_comp_uuid" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "parent_comp_uuid"`);
    }

}
