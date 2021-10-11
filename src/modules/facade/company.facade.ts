import {Company} from "../../models";
import {Injectable} from '@nestjs/common';
import {Config} from '../../util/config';
import {v4} from 'uuid';
import {EntityRepository, EntityManager} from "typeorm";
import {UserFacade} from "./user.facade";
import {HelperClass} from "../../filters/Helper";

@EntityRepository()
@Injectable()
export class CompanyFacade {

    constructor(private entityManager: EntityManager,
                private userFacade: UserFacade) {
    }

    async getCompanyByUuid(companyUuid) {
        return this.entityManager.createQueryBuilder(Company, 'c')
            .where('c.companyUuid=:companyUuid', {companyUuid: companyUuid})
            .getOne();
    }

    async getCompanyById(id) {
        return this.entityManager.createQueryBuilder(Company, 'c')
            .where('c.companyID=:id', {id: id})
            .getOne();
    }

    async getCompanyByName(companyName) {
        return this.entityManager.createQueryBuilder(Company, 'c')
            .where('c.companyName=:name', {name: companyName})
            .getOne();
    }

    async findAll(accountId: number, filter: string | undefined, offset: number | undefined, limit: number | undefined) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(Company, "company")
            .where("account.id = :accountId ")
            .leftJoinAndSelect("company.account", "account")
            .leftJoinAndSelect("company.type", "type")
            .where(" 1=1 ");

        if (filter) {
            query.andWhere(" LOWER(company.name) like LOWER(:filter)");
        }
        if (offset && limit && limit >= 0) {
            query.offset(offset);
        }

        if (!limit || limit < 1) {
            limit = Config.number("DEFAULT_LIMIT", 20);
        }
        let params = {accountId};
        if (filter) {
            params["filter"] = "%" + filter.toLowerCase() + "%";
        }
        query.setParameters(params);
        query.limit(limit);
        return query.getMany();
    }

    async getAllCompaniesByUserCreatorAndAccountId(userId, accountId, companyUuid) {
        let manager = await this.entityManager;
        let query1 = `SELECT count(*) FROM "public"."company" "company" 
                    LEFT JOIN "user" "user" ON "user"."user_uuid" = "company"."user_uuid"
                    WHERE "company"."user_creator"=${userId} AND "company"."acco_id"=${accountId}`;
        if (companyUuid) {
            query1 += `company.comp_uuid=${companyUuid}`;
        }
        let count = await manager.query(query1);

        let query2 = `SELECT "company"."comp_id" AS "company_comp_id", "company"."user_creator" AS "company_user_creator", 
                    "company"."comp_name" AS "company_comp_name", "company"."acco_id" AS "company_acco_id", 
                    "company"."comp_uuid" AS "company_comp_uuid", "company"."status" AS "company_status", 
                    "company"."balance" AS "company_balance", to_char("company"."created", 'YYYY-MM-DD') AS "company_created", 
                    "company"."identity_uuid" AS "company_identity_uuid", "company"."user_uuid" AS "company_user_uuid",
                    "company"."timezone" AS "company_timezone", "user"."user_first_name", "user"."user_last_name" FROM "public"."company" "company"
                    LEFT JOIN "user" "user" ON "user"."user_uuid" = "company"."user_uuid"
                    WHERE "company"."user_creator"=${userId} AND "company"."acco_id"=${accountId}`;
        
        if (companyUuid) {
            query2 += `company.comp_uuid=${companyUuid}`;
        }

        let result = await manager.query(query2);
        return [result, Number(count[0].count)]
    }

    // async getAllCompaniesByUserCreatorAndAccountId(userId, accountId, companyUuid) {
    //     let manager = await this.entityManager;
    //     let query = manager.createQueryBuilder(Company, 'company')
    //         // .addSelect("user.name")
    //         // .leftJoin("company.userCreatorID", "user")
    //         .where('company.userCreatorID=:userId', {userId: userId})
    //         .andWhere('company.accountID=:accountId', {accountId: accountId});

    //     if (companyUuid) {
    //         query.andWhere('company.companyUuid=:companyUuid', {companyUuid: companyUuid});
    //     }
    //     return query.getMany();
    // }

    async getAllCompanies(companyUuid) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(Company, 'company')

        if (companyUuid) {
            query.andWhere('company.companyUuid=:companyUuid', {companyUuid: companyUuid});
        }
        return query.getMany();
    }

    async deleteUserCompany(compId: number, userId: number) {
        let manager = await this.entityManager;
        manager.query("delete from user_company where user_id = $1 and comp_id = $2", [userId, compId]);
    }

    async createCompany(user, body, identityUuid, userUuid) {
        let status = (body.status) ? body.status : false;
        let balance = (body.balance) ? body.balance : 0;
        let manager = await this.entityManager;
        await manager.createQueryBuilder()
            .insert()
            .into(Company)
            .values({
                companyUuid: await v4(),
                accountID: user.accountId,
                companyName: body.companyName,
                userCreatorID: user.userId,
                status: status,
                balance: balance,
                created: new Date(),
                identityUuid: identityUuid,
                timezone: body.zone,
                userUuid: userUuid
            })
            .execute();
        return await manager.createQueryBuilder(Company, 'c')
            .where('c.companyName=:companyName', {companyName: body.companyName})
            .andWhere('c.userCreatorID=:userCreatorID', {userCreatorID: user.userId})
            .getOne();
    }

    async isCompanyExistByCompanyName(companyName, userCreatorID) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Company, 'company')
            .where('company.companyName=:companyName', {companyName: companyName})
            .andWhere('company.userCreatorID=:userCreatorID', {userCreatorID: userCreatorID})
            .getOne();
    }

    async isCompanyExistByCompanyUuid(companyUuid) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Company, 'company')
            .where('company.companyUuid=:companyUuid', {companyUuid: companyUuid})
            .getOne();
    }

    async getAllCompaniesByAccountId(accountId) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(Company, 'company')
            .where('company.accountID=:accountId', {accountId: accountId});

        let companies = await query.getMany();
        let companies_new = new Array();
        for (const company of companies) {
            let query_count1 = await manager.query(`select count(*) from "user" where user_company_name = '${company.companyName}' and account_id = ${accountId}`);
            let query_count2 = await manager.query(`select count(*) from "tracking_numbers" where comp_name = '${company.companyName}' and acco_id = ${accountId}`);
            let new_company = {
                users: query_count1[0].count,
                numbers: query_count2[0].count
            };
            Object.assign(new_company, company);
            companies_new.push(new_company);
        }
        return companies_new;
    }

    async addUsers(uuids, comp_name) {
        let manager = await this.entityManager;
        return await manager.transaction(async tEM => {
            for (const uuid of uuids) {
                let user = await this.userFacade.getUserByUuid(uuid);
                if (!user) {
                    await HelperClass.throwErrorHelper('user:userWithThisUuidIsNotExist');
                }
                else {
                    user.companyName = comp_name;
                    user = await tEM.save(user);
                }
            }
        });
    }

    async unassignUsers(comp_name) {
        return await this.userFacade.unassignCompanyUsers(comp_name);
    }

    async changeCompany(company) {
        
        let manager = await this.entityManager;
        return await manager.save(company);
    }

    async updateStatus(id, status) {
        return this.entityManager.createQueryBuilder()
            .update(Company)
            .set({
                status: status
            })
            .where('comp_id=:id', { id: id })
            .returning('*')
            .execute();

    }
}
