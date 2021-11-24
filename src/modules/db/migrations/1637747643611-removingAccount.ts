import {MigrationInterface, QueryRunner} from "typeorm";

export class removingAccount1637747643611 implements MigrationInterface {
    name = 'removingAccount1637747643611'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "user", "call_flow", "did", "account_blacklist", "account_tags", "recordings", "company", "tracking_numbers", "contacts", "payment", "call_flow_steps" CASCADE`);

        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_6acfec7285fdf9f463462de3e9f"`);
        await queryRunner.query(`ALTER TABLE "call_flow" DROP CONSTRAINT "FK_931b7e9d96e23422d260687d42e"`);
        await queryRunner.query(`ALTER TABLE "did" DROP CONSTRAINT "FK_4482009f2c2213288dbe2c4123e"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP CONSTRAINT "FK_50f78d243b3c779e807c002d249"`);
        await queryRunner.query(`ALTER TABLE "account_tags" DROP CONSTRAINT "FK_c7d1ad624036f5b978126e6089f"`);
        await queryRunner.query(`ALTER TABLE "recordings" DROP CONSTRAINT "FK_9f1639deff555993adc0731340d"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP CONSTRAINT "UQ_86ef064903e69c7e8242c993087"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "account_id" TO "company_id"`);
        await queryRunner.query(`ALTER TABLE "call_flow" RENAME COLUMN "acco_id" TO "company_id"`);
        await queryRunner.query(`ALTER TABLE "did" RENAME COLUMN "acco_id" TO "company_id"`);
        await queryRunner.query(`ALTER TABLE "company" RENAME COLUMN "acco_id" TO "plan_id"`);
        await queryRunner.query(`ALTER TABLE "account_tags" RENAME COLUMN "acco_id" TO "company_id"`);
        await queryRunner.query(`ALTER TABLE "account_tags" RENAME CONSTRAINT "REL_c7d1ad624036f5b978126e6089" TO "UQ_41d0e83d4fce02a86cb5317a366"`);
        await queryRunner.query(`ALTER TABLE "recordings" RENAME COLUMN "acco_id" TO "company_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP COLUMN "account_id"`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" DROP COLUMN "acco_id"`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" DROP COLUMN "company_uuid"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "company_uuid" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD "company_id" integer`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD "company_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" ADD "company_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "plan_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD CONSTRAINT "UQ_4340a8bcc32ba4c8a434864f8c7" UNIQUE ("number")`);
        await queryRunner.query(`ALTER TABLE "account_tags" DROP CONSTRAINT "UQ_41d0e83d4fce02a86cb5317a366"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_0afe32d362019ef68591227c438"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "REL_3c65cde8db4fba1bac42f3b366"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "REL_0afe32d362019ef68591227c43"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9e70b5f9d7095018e86970c7874" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "call_flow" ADD CONSTRAINT "FK_3dbeb4a8de1e4c6219b1fd2860c" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "did" ADD CONSTRAINT "FK_96555ea462c11a23693d1c64571" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD CONSTRAINT "FK_29ceda3cfd86c235a4f295c965b" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_tags" ADD CONSTRAINT "FK_41d0e83d4fce02a86cb5317a366" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recordings" ADD CONSTRAINT "FK_8e4e065579ad2ab960fbb63ec7b" FOREIGN KEY ("company_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661" FOREIGN KEY ("modified_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_0afe32d362019ef68591227c438" FOREIGN KEY ("comp_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_0afe32d362019ef68591227c438"`);
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661"`);
        await queryRunner.query(`ALTER TABLE "recordings" DROP CONSTRAINT "FK_8e4e065579ad2ab960fbb63ec7b"`);
        await queryRunner.query(`ALTER TABLE "account_tags" DROP CONSTRAINT "FK_41d0e83d4fce02a86cb5317a366"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP CONSTRAINT "FK_29ceda3cfd86c235a4f295c965b"`);
        await queryRunner.query(`ALTER TABLE "did" DROP CONSTRAINT "FK_96555ea462c11a23693d1c64571"`);
        await queryRunner.query(`ALTER TABLE "call_flow" DROP CONSTRAINT "FK_3dbeb4a8de1e4c6219b1fd2860c"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9e70b5f9d7095018e86970c7874"`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "REL_0afe32d362019ef68591227c43" UNIQUE ("comp_id")`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "REL_3c65cde8db4fba1bac42f3b366" UNIQUE ("modified_by")`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_0afe32d362019ef68591227c438" FOREIGN KEY ("comp_id") REFERENCES "company"("comp_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "FK_3c65cde8db4fba1bac42f3b3661" FOREIGN KEY ("modified_by") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_tags" ADD CONSTRAINT "UQ_41d0e83d4fce02a86cb5317a366" UNIQUE ("company_id")`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP CONSTRAINT "UQ_4340a8bcc32ba4c8a434864f8c7"`);
        await queryRunner.query(`ALTER TABLE "company" ALTER COLUMN "plan_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "company_uuid"`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" ADD "company_uuid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tracking_numbers" ADD "acco_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD "account_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "account_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "recordings" RENAME COLUMN "company_id" TO "acco_id"`);
        await queryRunner.query(`ALTER TABLE "account_tags" RENAME CONSTRAINT "UQ_41d0e83d4fce02a86cb5317a366" TO "REL_c7d1ad624036f5b978126e6089"`);
        await queryRunner.query(`ALTER TABLE "account_tags" RENAME COLUMN "company_id" TO "acco_id"`);
        await queryRunner.query(`ALTER TABLE "company" RENAME COLUMN "plan_id" TO "acco_id"`);
        await queryRunner.query(`ALTER TABLE "did" RENAME COLUMN "company_id" TO "acco_id"`);
        await queryRunner.query(`ALTER TABLE "call_flow" RENAME COLUMN "company_id" TO "acco_id"`);
        await queryRunner.query(`ALTER TABLE "payment" RENAME COLUMN "company_id" TO "account_id"`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD CONSTRAINT "UQ_86ef064903e69c7e8242c993087" UNIQUE ("account_id", "number")`);
        await queryRunner.query(`ALTER TABLE "recordings" ADD CONSTRAINT "FK_9f1639deff555993adc0731340d" FOREIGN KEY ("acco_id") REFERENCES "account"("acco_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_tags" ADD CONSTRAINT "FK_c7d1ad624036f5b978126e6089f" FOREIGN KEY ("acco_id") REFERENCES "account"("acco_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account_blacklist" ADD CONSTRAINT "FK_50f78d243b3c779e807c002d249" FOREIGN KEY ("account_id") REFERENCES "account"("acco_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "did" ADD CONSTRAINT "FK_4482009f2c2213288dbe2c4123e" FOREIGN KEY ("acco_id") REFERENCES "account"("acco_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "call_flow" ADD CONSTRAINT "FK_931b7e9d96e23422d260687d42e" FOREIGN KEY ("acco_id") REFERENCES "account"("acco_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_6acfec7285fdf9f463462de3e9f" FOREIGN KEY ("account_id") REFERENCES "account"("acco_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
