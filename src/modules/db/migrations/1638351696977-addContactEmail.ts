import {MigrationInterface, QueryRunner} from "typeorm";

export class addContactEmail1638351696977 implements MigrationInterface {
    name = 'addContactEmail1638351696977'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" ADD "cont_email" character varying`);
        await queryRunner.query(`ALTER TYPE "user_type_enum" RENAME TO "user_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "user_type_enum" AS ENUM('company_admin', 'company_user')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" TYPE "user_type_enum" USING "type"::"text"::"user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" SET DEFAULT 'company_user'`);
        await queryRunner.query(`DROP TYPE "user_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "user_type_enum_old" AS ENUM('company_admin', 'notification')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" TYPE "user_type_enum_old" USING "type"::"text"::"user_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "type" SET DEFAULT 'notification'`);
        await queryRunner.query(`DROP TYPE "user_type_enum"`);
        await queryRunner.query(`ALTER TYPE "user_type_enum_old" RENAME TO "user_type_enum"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "cont_email"`);
    }

}
