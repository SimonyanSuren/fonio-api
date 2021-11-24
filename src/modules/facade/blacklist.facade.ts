import {AccountBlacklist, Company} from "../../models";
import {Injectable} from '@nestjs/common';
import {v4} from 'uuid';
import {EntityRepository, EntityManager} from "typeorm";
import { MessageCodeError } from '../../util/error';
import { StringLiteralLike } from "typescript";

@EntityRepository()
@Injectable()
export class BlackListFacade {

    constructor(private entityManager: EntityManager) {
    }

    async getAllBlackListsByCompanyUuid(userId, companyUuid) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountBlacklist, 'bl')
            .where('bl.user=:userId', {userId: userId})
            .where('bl.companyUuid=:companyUuid', {companyUuid: companyUuid})
            .getMany();
    }

    async getAllBlackListsByCompanyId(companyId) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountBlacklist, 'bl')
            .where('bl.companyId=:companyId', {companyId})
            .getMany();
    }

    async deletePhone(companyId: number, uuid: string) {
        let manager = await this.entityManager;
        await manager.query("delete from account_blacklist where company_id = $1 and acbl_uuid = $2 returning *", [companyId, uuid]);
        return true;
    }

    async isBlackListExist(companyId, uuid) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountBlacklist, 'abl')
            .where('abl.company=:companyId', {companyId})
            .andWhere('abl.uuid=:uuid', {uuid})
            .getOne();
    }

    async getCompanyByAccountIdAndUserId(userId, companyId) {
        return this.entityManager.createQueryBuilder(Company, 'c')
            .where('c.companyID=:companyId', {companyId})
            .andWhere('c.userCreatorID=:userId', {userId})
            .getOne();
    }

    async create(currentUser, body: any) {
        try {
            if (!body.number) throw new Error('blacklist:youShouldPassNumber');
            // if (!body.companyUuid) throw new Error('blacklist:youShouldPassCompanyUuid');
            // let company = await this.getCompanyByAccountIdAndUserId(currentUser.userId, currentUser.accountId, body.companyUuid);
            // if (!company) throw new Error('blacklist:youDoNotHaveThisCompanyCreated');
            // let bl = await this.isCompanyExistByCompanyUuid(body.companyUuid, currentUser.accountId, body.number);
            // if (bl) throw new Error('blacklist:theSameNumberAlreadyAdded');
            let reason = (body.reason) ? body.reason : 'no reason';
            return await this.entityManager.createQueryBuilder()
                .insert()
                .into(AccountBlacklist)
                .values({
                    uuid: await v4(),
                    companyId: currentUser.companyId,
                    companyUuid: body.companyUuid,
                    number: body.number,
                    user: currentUser.userId,
                    reason: reason,
                    otherDetail: body.other_detail
                })
                .returning('*')
                .execute();
        } catch (err) {
            throw err;
        }
    }

    async isCompanyExistByCompanyUuid(companyUuid, userId, numberField) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountBlacklist, "bl")
            .where("bl.companyUuid = :companyUuid", {companyUuid: companyUuid})
            .andWhere("bl.user = :userId", {userId: userId})
            .andWhere("bl.number = :number", {number: numberField})
            .getOne();
    }

    async findById(id: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountBlacklist, "bl")
            .where("bl.id = :id ")
            .setParameters({id})
            .getOne();
    }

    async changeStatus(status, id) {
        let acbl = await this.findById(id);
        if (!acbl) {
            throw new MessageCodeError("AccountBlack:NotFound");
        }
        acbl.status = status;
        let manager = await this.entityManager;
        return await manager.save(acbl);
    }

}
