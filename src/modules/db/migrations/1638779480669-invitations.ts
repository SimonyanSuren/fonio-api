import {MigrationInterface, QueryRunner} from "typeorm";

export class invitations1638779480669 implements MigrationInterface {
    name = 'invitations1638779480669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "invitations_type_enum" AS ENUM('company_admin', 'company_user')`);
        await queryRunner.query(`CREATE TABLE "invitations" ("invitation_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "company_uuid" character varying NOT NULL, "invitation_uuid" character varying NOT NULL, "type" "invitations_type_enum" NOT NULL DEFAULT 'company_user', CONSTRAINT "PK_56a33d475f5faf8b63d020b650f" PRIMARY KEY ("invitation_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invitations"`);
        await queryRunner.query(`DROP TYPE "invitations_type_enum"`);
    }

}
