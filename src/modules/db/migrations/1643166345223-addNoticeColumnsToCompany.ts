import {MigrationInterface, QueryRunner} from "typeorm";

export class addNoticeColumnsToCompany1643166345223 implements MigrationInterface {
    name = 'addNoticeColumnsToCompany1643166345223'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD COLUMN "notice" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP "notice"`);
    }

}
