import {MigrationInterface, QueryRunner} from "typeorm";

export class addPurgedToUser1643122355254 implements MigrationInterface {
    name = 'addPurgedToUser1643122355254'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "purged" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP "purged"`);
    }

}
