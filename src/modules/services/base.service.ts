import { BaseAbstractRepository } from '../db/repositories/base.abstract.repository';

export interface getEntities {
    page:number,
    pageSize: number,
    where:any,
    relations?:string[],
    join?:any,
  }

export class BaseService {

    public async createEntity<T>(repository: BaseAbstractRepository<T>, body: any): Promise<T> {
        try {
            return await repository.create(
                body
            );
        } catch (err) {
            console.log(err);
            throw err
        }
    }

    public async getEntity<T>(repository: BaseAbstractRepository<T>, where, relations?, join?): Promise<any> {
        const entity = await repository.findOne({
            relations,
            where,
            join
        });
        if (!entity) {
            throw new Error("404");
        }

        return entity;
    }



    public async updateEntity<T>(repository: BaseAbstractRepository<T>,
        where: object,
        body: any,
    ): Promise<T> {
        try {
            const entity = await this.getEntity(repository, where)
            // @ts-ignore
            return await repository.update({
                ...entity,
                ...body
            });

        } catch (err) {
            console.log(err);
            throw err
        }
    }



    public async getEntities<T>(repository: BaseAbstractRepository<T>, {
        page,
        pageSize,
        where,
        relations=undefined,
        join = undefined,
    }:getEntities, order: any = undefined,): Promise<any> {
        const take = pageSize;
        const skip = take && page && (page - 1) * take;
        return await repository.find({
            relations,
            where,
            join,
            take,
            skip,
            order,

        });
    }

    public async deleteEntity<T>(repository: BaseAbstractRepository<T>, where): Promise<T> {
        return await repository.delete(where);
    }

}
