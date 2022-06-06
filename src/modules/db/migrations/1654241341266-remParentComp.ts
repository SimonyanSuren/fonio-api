import {MigrationInterface, QueryRunner} from "typeorm";

export class remParentComp1654241341266 implements MigrationInterface {
    name = 'remParentComp1654241341266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "did" RENAME COLUMN "returned_on" TO "number_name"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "inbound_call_cost"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "outbound_call_cost"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "inbound_sms_cost"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "outbound_sms_cost"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "did_mnc"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "did_nrc"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "company_uuid"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "invoice_uuid"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "invoice_number"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "billing_period_start_time"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "billing_period_end_time"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "total"`);
        await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "created_on"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "parent_comp_uuid"`);
        await queryRunner.query(`ALTER TABLE "countries" DROP COLUMN "prefix"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "purged" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "did" DROP COLUMN "number_name"`);
        await queryRunner.query(`ALTER TABLE "did" ADD "number_name" character varying`);
        await queryRunner.query(`ALTER TABLE "company" DROP CONSTRAINT "unique_comp_uuid"`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" SET DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "notice" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "notice" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "expired_on"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "expired_on" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "expired_on"`);
        await queryRunner.query(`ALTER TABLE "invitations" ADD "expired_on" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "notice" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "notice" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "add_number_notification" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "remove_number_notification" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ADD CONSTRAINT "unique_comp_uuid" UNIQUE ("comp_uuid")`);
        await queryRunner.query(`ALTER TABLE "did" DROP COLUMN "number_name"`);
        await queryRunner.query(`ALTER TABLE "did" ADD "number_name" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "purged" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "countries" ADD "prefix" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ADD "parent_comp_uuid" character varying`);
        await queryRunner.query(`ALTER TABLE "payment" ADD "created_on" TIMESTAMP DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "total" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "billing_period_end_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "billing_period_start_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "invoice_number" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "invoice_uuid" uuid DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "company_uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "did_nrc" double precision`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "did_mnc" double precision`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "outbound_sms_cost" double precision`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "inbound_sms_cost" double precision`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "outbound_call_cost" double precision`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "inbound_call_cost" double precision`);
        await queryRunner.query(`ALTER TABLE "did" RENAME COLUMN "number_name" TO "returned_on"`);
    }

}
