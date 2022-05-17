import {MigrationInterface, QueryRunner} from "typeorm";

export class invitation1652754855362 implements MigrationInterface {
    name = 'invitation1652754855362'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."invitations_type_enum" AS ENUM('company_admin', 'company_user')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("invitation_id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "company_uuid" character varying NOT NULL, "invitation_uuid" character varying NOT NULL, "type" "public"."invitations_type_enum" NOT NULL DEFAULT 'company_user', "created_on" TIMESTAMP NOT NULL DEFAULT now(), "expired_on" TIMESTAMP, "accepted_on" TIMESTAMP, CONSTRAINT "PK_56a33d475f5faf8b63d020b650f" PRIMARY KEY ("invitation_id"))`);
        await queryRunner.query(`ALTER TABLE "company" ADD "notice" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "purged" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" SET DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "purged" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "notice"`);
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "public"."invitations_type_enum"`);
    }

}
