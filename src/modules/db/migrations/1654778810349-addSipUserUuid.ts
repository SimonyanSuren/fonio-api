import {MigrationInterface, QueryRunner} from "typeorm";

export class addSipUserUuid1654778810349 implements MigrationInterface {
    name = 'addSipUserUuid1654778810349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "sip_user_uuid" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "sip_user_uuid"`);
    }

}
