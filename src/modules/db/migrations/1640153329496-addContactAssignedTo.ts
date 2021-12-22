import {MigrationInterface, QueryRunner} from "typeorm";

export class addContactAssignedTo1640153329496 implements MigrationInterface {
    name = 'addContactAssignedTo1640153329496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661"`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD "assigned_to" integer`);
        await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "modified_by" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_d90dcb0992cd86fbbb744f8f8a6" FOREIGN KEY ("assigned_to") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_d90dcb0992cd86fbbb744f8f8a6"`);
        await queryRunner.query(`ALTER TABLE "contacts" ALTER COLUMN "modified_by" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP COLUMN "assigned_to"`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661" FOREIGN KEY ("modified_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
