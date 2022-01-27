import { Injectable } from '@nestjs/common';
import { Plan, Company, AccountNumber } from "../../models";
import { PlanCompany } from '../../models/plan_company';
import { EntityRepository, EntityManager } from "typeorm";

@EntityRepository()
@Injectable()
export class PlanFacade {

    constructor(private entityManager: EntityManager) {
    }

    async getAllPlans(orderBy='order', orderType, offset, limit) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(Plan, "plan")
        let by
        if (orderBy === 'created') by = 'creation';
        if (orderBy === 'order') by = 'order'
        if (by) {
            if (!orderType || "ascending" === orderType) {
                query.orderBy(`plan.plan_${by}`, "ASC");
            } else if (!orderType || "descending" === orderType) {
                query.orderBy(`plan.plan_${by}`, "DESC");
            }
        }

        query.offset(offset);
        query.limit(limit);
        const [items, total] = await query.getManyAndCount();

        let number = await manager.query(`SELECT tracking_numbers.plan_id,
                count(*) as did_count
            FROM
                "public"."tracking_numbers"
            GROUP BY tracking_numbers.plan_id`);

        let total_did_count = (await manager.query(`SELECT count(*)
            FROM "public"."did"`))[0].count;

        return { success: true, payload: { items, total, number, total_did_count } }
    }

    async getPlanByPlanId(planID) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Plan, "p")
            .where("p.id = :planID")
            .setParameters({ planID: planID })
            .getOne();
    }

    async getPlanByPlanType(type) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Plan, "p")
            .where("p.type = :type")
            .setParameters({ type })
            .getOne();
    }

    async getNumbersCountByPlanId(planID) {
        return await this.entityManager.createQueryBuilder(AccountNumber, 'an')
            .where('an.plan_id=:id', {id: planID})
            .getCount();
    }

    async updateAllPlanEntityByPlanUuid(object, id) {
        let manager = await this.entityManager;
        await manager.createQueryBuilder()
            .update(Plan)
            .set({
                name: object.name,
                monthlyAmount: object.monthlyAmount,
                annuallyAmount: object.annuallyAmount,
                numbers: object.numbers,
                minutes: object.minutes,
                text: object.text,
                status: object.status
            })
            .where("id = :id", { id: id })
            .execute();

        return this.getPlanByPlanUuid(id);
    }

    // async assignPlanToCompany(body, userId, isPlanAssignedToCompany) {
    //     if (!isPlanAssignedToCompany) {
    //         return await this.insertPlanCompanyEntityIntoDb(body.planID, body.companyUuid, userId);
    //     }
    //     return await this.updatePlanCompanyEntity(body.planID, body.companyUuid, userId);
    // }

    async insertPlanCompanyEntityIntoDb(planID, companyUuid, userID) {
        return await this.entityManager.createQueryBuilder()
            .insert()
            .into(PlanCompany)
            .values({
                userID: userID,
                companyUuid: companyUuid,
                planID: planID
            })
            .returning('*')
            .execute();
    }

    async updatePlanCompanyEntity(planID, companyUuid, userID) {
        return await this.entityManager.createQueryBuilder()
            .update(PlanCompany)
            .set({
                userID: userID,
                companyUuid: companyUuid,
                planID: planID
            })
            .where('companyUuid=:companyUuid', { companyUuid: companyUuid })
            .returning('*')
            .execute();
    }

    async isPlanAlreadyAssignedToCompany(companyUuid) {
        return await this.entityManager.createQueryBuilder(PlanCompany, 'pc')
            .where('pc.companyUuid=:companyUuid', { companyUuid: companyUuid })
            .getOne();
    }

    async isCompanyExistByCompanyUuid(companyUuid) {
        return await this.entityManager.createQueryBuilder(Company, 'c')
            .where('c.companyUuid=:companyUuid', { companyUuid: companyUuid })
            .getOne();
    }

    async addPlanIntoDb(object) {
        return await this.entityManager.createQueryBuilder()
            .insert()
            .into(Plan)
            .values({
                name: object.name,
                monthlyAmount: object.monthlyAmount,
                annuallyAmount: object.annuallyAmount,
                numbers: object.numbers,
                minutes: object.minutes,
                text: object.text,
                type: object.type,
                status: true
            })
            .returning('*')
            .execute();
    }

    async deletePlanFromDb(id) {
        return await this.entityManager.createQueryBuilder()
            .delete()
            .from(Plan)
            .where('id=:id', { id: id })
            .returning('*')
            .execute();
    }

    async getPlanObjectForUpdating(body, oldPlanVersion) {
        let name = (body.name) ? body.name : oldPlanVersion.name;
        let monthlyAmount = (body.monthlyAmount) ? body.monthlyAmount : oldPlanVersion.monthlyAmount;
        let annuallyAmount = (body.annuallyAmount) ? body.annuallyAmount : oldPlanVersion.annuallyAmount;
        let numbers = (body.numbers) ? body.numbers : oldPlanVersion.numbers;
        let minutes = (body.minutes) ? body.minutes : oldPlanVersion.minutes;
        let text = (body.text) ? body.text : oldPlanVersion.text;
        let status = (body.status != undefined) ? body.status : oldPlanVersion.status;
        return {
            name,
            monthlyAmount,
            annuallyAmount,
            numbers,
            minutes,
            text,
            status
        };
    }

    async getPlanObjectForAdding(body) {
        let name = (body.name) ? body.name : null;
        let monthlyAmount = (body.monthlyAmount) ? body.monthlyAmount : 0;
        let annuallyAmount = (body.annuallyAmount) ? body.annuallyAmount : 0;
        let numbers = (body.numbers) ? body.numbers : 0;
        let minutes = (body.minutes) ? body.minutes : 0;
        let text = (body.text) ? body.text : null;
        let type = body.type;
        return {
            name,
            monthlyAmount,
            annuallyAmount,
            numbers,
            minutes,
            text,
            type
        };
    }

    async getPlanByPlanUuid(id) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder(Plan, "p")
            .where("p.id = :id")
            .setParameters({ id: id })
            .getOne();
    }

    async updatePlanStatus(id, status) {
        return this.entityManager.createQueryBuilder()
            .update(Plan)
            .set({
                status: status
            })
            .where('id=:id', { id: id })
            .returning('*')
            .execute();
    }

}