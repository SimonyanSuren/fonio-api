import {MigrationInterface, QueryRunner} from "typeorm";

export class addPlanType1642581997653 implements MigrationInterface {
    name = 'addPlanType1642581997653'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "plan_type_enum" AS ENUM('toll_free', 'long_code')`);
        await queryRunner.query(`ALTER TABLE "plan" ADD "type" "plan_type_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "plan" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "plan_type_enum"`);
    }

}
