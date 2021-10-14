import {MigrationInterface, QueryRunner} from "typeorm";

export class addUserSubdomain1634196602985 implements MigrationInterface {
    name = 'addUserSubdomain1634196602985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "subdomain" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "subdomain"`);
    }

}
