import {MigrationInterface, QueryRunner} from "typeorm";

export class addCompanyNotification1638437957843 implements MigrationInterface {
    name = 'addCompanyNotification1638437957843'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "notification" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "notification"`);
    }

}
