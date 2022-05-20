import { MigrationInterface, QueryRunner } from 'typeorm';

export class invitations1652993870963 implements MigrationInterface {
  name = 'invitations1652993870963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."invitations_type_enum" AS ENUM('company_admin', 'company_user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invitations" ("invitation_id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "company_uuid" character varying NOT NULL, "invitation_uuid" character varying NOT NULL, "type" "public"."invitations_type_enum" NOT NULL DEFAULT 'company_user', "created_on" TIMESTAMP NOT NULL DEFAULT now(), "expired_on" TIMESTAMP, "accepted_on" TIMESTAMP, CONSTRAINT "PK_56a33d475f5faf8b63d020b650f" PRIMARY KEY ("invitation_id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "invitations"`);
    await queryRunner.query(`DROP TYPE "public"."invitations_type_enum"`);
  }
}
