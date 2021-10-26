import {MigrationInterface, QueryRunner} from "typeorm";

export class addResetPasswordHash1635255485496 implements MigrationInterface {
    name = 'addResetPasswordHash1635255485496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "reset_password_hash" character varying NOT NULL DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "reset_password_hash"`);
    }

}
