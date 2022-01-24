import {MigrationInterface, QueryRunner} from "typeorm";

export class removePlanUserCompany1642663295121 implements MigrationInterface {
    name = 'removePlanUserCompany1642663295121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "plan_id"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "plan_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD "plan_id" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "plan_id" integer`);
    }

}
