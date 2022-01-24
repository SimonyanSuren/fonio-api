import {MigrationInterface, QueryRunner} from "typeorm";

export class addColumnsToPayment1643017518913 implements MigrationInterface {
    name = 'addColumnsToPayment1643017518913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" ADD "pay_unit_amount" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "plan_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "duration" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "is_month" boolean NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "is_month"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "plan_id"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "pay_unit_amount"`);
    }

}
