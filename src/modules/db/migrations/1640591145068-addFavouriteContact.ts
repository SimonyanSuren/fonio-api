import {MigrationInterface, QueryRunner} from "typeorm";

export class addFavouriteContact1640591145068 implements MigrationInterface {
    name = 'addFavouriteContact1640591145068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" ADD "cont_favourite" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "cont_favourite"`);
    }

}
