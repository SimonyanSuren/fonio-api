import { AccountTags, User, Data, Company } from "../../models";
import { Injectable } from '@nestjs/common';
import { MessageCodeError } from '../../util/error';

import { EntityRepository, EntityManager, AbstractRepository, Connection, Repository } from "typeorm";

@EntityRepository()
@Injectable()
export class TagFacade {

    constructor(private entityManager: EntityManager) { }

    async findAllCompany(companyId: number) {
        let manager = await this.entityManager;
        return await manager.query(` SELECT acta_id as id, acta_name as name, acta_color as color, acta_bg_color as bg_color
        FROM account_tags
        where company_id=$1; `, [companyId]);
    }

    async findById(companyId: number, actaId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(AccountTags, "acta")
            .leftJoinAndSelect("acta.company", "company")
            .where("company.comp_id = :companyId ")
            .andWhere("acta.id = :actaId ")
            .setParameters({ companyId, actaId })
            .getOne();
    }
    async create(currentUser, tag: AccountTags) {
        console.log("tag", tag);
        let manager = await this.entityManager;
        tag.company = Company.withId(currentUser.companyId);
        tag.user = User.withId(currentUser.userId);
        return await manager.save(tag);

    }
    async edit(currentUser, tagId: number, tag: AccountTags) {
        let tagFound = await this.findById(currentUser.companyId, tagId);
        if (!tagFound) {
            throw new MessageCodeError("tag:NotFound");
        }
        console.log("tag", tag);
        let manager = await this.entityManager;
        tagFound.color = tag.color;
        tagFound.name = tag.name;
        tagFound.backgroundColor = tag.backgroundColor;
        return await manager.save(tagFound);

    }
    async delete(currentUser, tagId: number) {
        let tagFound = await this.findById(currentUser.companyId, tagId);
        if (!tagFound) {
            throw new MessageCodeError("tag:NotFound");
        }
        console.log("tag", tagFound);
        let manager = await this.entityManager;
        try {
            await manager.query("delete from account_tags where acta_id = $1", [tagId]);
        } catch (error) {
            throw new MessageCodeError("active:relationship");
        }

        return tagFound;

    }


}