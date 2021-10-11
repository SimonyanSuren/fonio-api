import { Data } from "../../models";
import { Injectable } from '@nestjs/common';
import { Constants } from '../../util/constants';

import { EntityRepository, EntityManager } from "typeorm";

@EntityRepository()
@Injectable()
export class DataFacade {


    constructor(private entityManager: EntityManager) {}

    async findByCategory(category: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Data, "data")
            .where("category.id = :category ")
            .leftJoinAndSelect("data.category", "category")
            .setParameters({ category })
            .getMany();
    }

    async findByID(dataId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Data, "data")
            .where("data.id = :dataId ")
            .leftJoinAndSelect("data.category", "category")
            .setParameters({ dataId })
            .getOne();
    }

    async findByName(name: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Data, "data")
            .where("lower(data.name) = lower(:name) ")
            .leftJoinAndSelect("data.category", "category")
            .setParameters({ name: name.trim() })
            .getOne();
    }
    
    async findTagByID(dataId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Data, "data")
            .where("data.id = :dataId ")
            .where("category.id = :tagCategory ")
            .leftJoinAndSelect("data.category", "category")
            .setParameters({ dataId, tagCategory: Constants.CATEGORY_TAG })
            .getOne();
    }
}