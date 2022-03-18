import {MigrationInterface, QueryRunner} from "typeorm";

export class addNotificationStatusColumnsToCompany1643122355234 implements MigrationInterface {
    name = 'addNotificationStatusColumnsToCompany1643122355234'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ADD COLUMN "remove_number_notification"`);
        await queryRunner.query(`ALTER TABLE "company" ADD COLUMN "add_number_notification"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP "remove_number_notification" boolean`);
        await queryRunner.query(`ALTER TABLE "company" DROP "add_number_notification" boolean`);
    }

}
