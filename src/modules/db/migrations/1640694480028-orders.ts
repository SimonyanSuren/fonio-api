import {MigrationInterface, QueryRunner} from "typeorm";

export class orders1640694480028 implements MigrationInterface {
    name = 'orders1640694480028'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "orders" ("order_id" SERIAL NOT NULL, "order_uuid" character varying NOT NULL, "user_uuid" character varying NOT NULL, "order_state" character varying NOT NULL, "order_done" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_cad55b3cb25b38be94d2ce831db" PRIMARY KEY ("order_id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "orders"`);
    }

}
