import {EntityManager, EntityRepository} from "typeorm";
import {Injectable} from "@nestjs/common";
import {Company, User, Account} from "../../models";
import {type} from "os";

@EntityRepository()
@Injectable()
export class AdminFacade {
    constructor(private entityManager: EntityManager) {
    }

    async findByEmail() {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Company, "c")
            .getMany();
    }

    async getAllUsersList(orderBy, orderType, offset, limit, search?) {
        console.log(orderType,orderBy)

        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(User, "user");
        if (!orderType || "ascending" === orderType) {
            query.orderBy(`user.${orderBy}`, "ASC");
        } else if (!orderType || "descending" === orderType) {
            query.orderBy(`user.${orderBy}`, "DESC");
        }

        if (search) {
            query.where("user.email like :email", { email:`%${search}%` });
        }

        query.offset(offset);
        query.limit(limit);

        return await query.getManyAndCount();
    }

    async parseRegistrationUsersList(users) {
        for (let i = 0; i < users.length; i++) {
            users[i].firstName = undefined;
            users[i].lastName = undefined;
            users[i].password = undefined;
            users[i].salt = undefined;
            users[i].avatar = undefined;
            users[i].activationHash = undefined;
            users[i].activationExpire = undefined;
            users[i].updated = undefined;
            users[i].planID = undefined;
            users[i].plaintText = undefined;
            users[i].isAdmin = undefined;
            users[i].userIdentityOpenTact = undefined;
            users[i].invoiceEmail = undefined;
            users[i].machineDetection = undefined;
            users[i].forwardSoftphone = undefined;
        }
        return users;
    }

    async isUserWithTheSameUserUuidExist(userUuid) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(User, 'u')
            .where('u.uuid=:userUuid')
            .setParameters({userUuid: userUuid})
            .getOne();
    }

    async isAccountExistByAccountID(accountID) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Account, 'a')
            .where('a.id=:accountID')
            .setParameters({accountID: accountID})
            .getOne();
    }

    async updateCompanyIdentityUuidByAccountId(accoID, identityUuid) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder()
            .update(Company)
            .set({
                identityUuid: identityUuid
            })
            .where('accountID=:accountID', {accountID: accoID})
            .execute();
    }

    async isUserIdentityCreated(user) {
        if (user.userIdentityOpenTact) {
            return false;
        }
        return true;
    }

    async updateUserIdentityStatus(userUuid) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder()
            .update(User)
            .set({userIdentityOpenTact: true})
            .where("uuid = :userUuid", {userUuid: userUuid})
            .execute();
    }

    async updateUserActivationStatus(accountID, userUuid, status) {
        let manager = await this.entityManager;
        await manager.createQueryBuilder()
            .update(User)
            .set({emailConfirmed: status})
            .where("uuid = :userUuid", {userUuid})
            .execute();
        await manager.createQueryBuilder()
            .update(Account)
            .set({status: status})
            .where("id = :accountID", {accountID})
            .execute();
    }

    async getUsersByPlan(planID, email?, order_by?, order_type?) {
        let by
        if (order_by === 'created_at') by = 'user_creation';

        return this.entityManager.query(`SELECT user_first_name, user_last_name, user_email, user_creation FROM "public"."user" 
            WHERE plan_id = ${planID} ${email ? `AND user_email LIKE '%${email}%'` : ''}
            ${(order_by && order_type) ? `ORDER BY ${by} ${order_type}` : ''}`);
    }

    async getUsersLastRegistered() {
        return this.entityManager.query(`SELECT user_creation FROM "public"."user" where user_creation > current_timestamp - interval '30 day'`);
    }

    async getDidLastRegistered() {
        return this.entityManager.query(`SELECT register_date FROM "public"."tracking_numbers" where register_date > current_timestamp - interval '30 day'`);
    }

    async getUsersDailyStatLastRegistered() {
        let users = await this.entityManager.query(`SELECT DISTINCT count(c.user_id) as count, r.user_creation as create_time
            FROM "public"."user" as r 
            LEFT JOIN "public"."user" as c ON c.user_creation <= r.user_creation
            WHERE r.user_creation > current_timestamp - interval '30 day'
            GROUP BY r.user_id ORDER BY r.user_creation DESC`);

        users.push(...await this.entityManager.query(`SELECT DISTINCT count(c.user_id) as count, r.user_creation as create_time
            FROM "public"."user" as r 
            LEFT JOIN "public"."user" as c ON c.user_creation <= r.user_creation
            GROUP BY r.user_id ORDER BY r.user_creation DESC LIMIT 1 OFFSET ${users.length}`));

        return users;
    }

    async getConfigPayment() {
        return await this.entityManager.query(`SELECT * FROM "public"."payment_settings" where status=true`);
    }

    async updateConfigPayment(payment_setting) {
        let old = await this.entityManager.query(`SELECT * FROM "public"."payment_settings" where status=true`);
        let query;
        if (old.length) {
            query = `UPDATE "public"."payment_settings" SET `;
            let update_fields:any = [];
            if (payment_setting.stripe_skey)
                update_fields.push(`stripe_skey='${payment_setting.stripe_skey}'`);
            if (payment_setting.stripe_pkey)
                update_fields.push(`stripe_pkey='${payment_setting.stripe_pkey}'`);
            if (payment_setting.paypal_client_id)
                update_fields.push(`paypal_client_id='${payment_setting.paypal_client_id}'`);
            if (payment_setting.charge_type)
                update_fields.push(`charge_type='${payment_setting.charge_type}'`);
            if (payment_setting.paypal_test_mode != undefined)
                update_fields.push(`paypal_test_mode='${payment_setting.paypal_test_mode}'`);
            if (payment_setting.payment_confirm != undefined)
                update_fields.push(`payment_confirm='${payment_setting.payment_confirm}'`);
            if (payment_setting.email_note != undefined)
                update_fields.push(`email_note='${payment_setting.email_note}'`);
            if (payment_setting.email_confirm_to)
                update_fields.push(`email_confirm_to='${payment_setting.email_confirm_to}'`);
            if (payment_setting.email_cc_to)
                update_fields.push(`email_cc_to='${payment_setting.email_cc_to}'`);
            
            query += update_fields.join(',') + ` where status=true`;
        }
        else {
            query = `INSERT INTO "public"."payment_settings"(`;
            let insert_fields:any = [];
            let insert_values:any = [];
            if (payment_setting.stripe_skey) {
                insert_fields.push(`stripe_skey`);
                insert_values.push(payment_setting.stripe_skey);
            }
            if (payment_setting.stripe_pkey) {
                insert_fields.push(`stripe_pkey`);
                insert_values.push(payment_setting.stripe_pkey);
            }
            if (payment_setting.paypal_client_id) {
                insert_fields.push(`paypal_client_id`);
                insert_values.push(payment_setting.paypal_client_id);
            }
            if (payment_setting.charge_type) {
                insert_fields.push(`charge_type`);
                insert_values.push(payment_setting.charge_type);
            }
            if (payment_setting.paypal_test_mode) {
                insert_fields.push(`paypal_test_mode`);
                insert_values.push(payment_setting.paypal_test_mode);
            }
            if (payment_setting.payment_confirm) {
                insert_fields.push(`payment_confirm`);
                insert_values.push(payment_setting.payment_confirm);
            }
            if (payment_setting.email_note) {
                insert_fields.push(`email_note`);
                insert_values.push(payment_setting.email_note);
            }
            if (payment_setting.email_confirm_to) {
                insert_fields.push(`email_confirm_to`);
                insert_values.push(payment_setting.email_confirm_to);
            }
            if (payment_setting.email_cc_to) {
                insert_fields.push(`email_cc_to`);
                insert_values.push(payment_setting.email_cc_to);
            }
            insert_fields.push(`status`);
            insert_values.push(true);
            
            query += insert_fields.join(',') + `) values('` + insert_values.join(`','`) + `') returning *`;
        }
        return await this.entityManager.query(query);
    }
}