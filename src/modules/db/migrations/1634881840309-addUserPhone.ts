import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserPhone1634881840309 implements MigrationInterface {
    name = 'addUserPhone1634881840309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "user_phone" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "user_phone"`);
    }

}
