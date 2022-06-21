import { Injectable } from '@nestjs/common';
import { MessageCodeError } from '../../util/error';

import { EntityRepository, EntityManager } from 'typeorm';
import { Did } from '../../models/';
import moment = require('moment');

@EntityRepository()
@Injectable()
export class DidFacade {
  constructor(private entityManager: EntityManager) {}

  async findByNumber(number: number) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(Did, 'did')
      .where('did.number = :number ')
      .setParameters({ number })
      .getOne();
  }

  async findByNumbers(numbers:string[]) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(Did, 'did')
      .where('did.number IN (:...numbers) ', { numbers })
      .getMany();
  }

  async create(currentUser, number) {
    let manager = await this.entityManager;
    let nmbr = await this.findByNumber(number);
    if (nmbr) {
      throw new MessageCodeError('number:AlreadyExists');
    }
    let did = new Did();
    did.number = number;
    did.status = true;
    return await manager.save(did);
  }

  async addDidAfterBuy(
    userID,
    companyID,
    didOpentactID,
    didStatus,
    didNumber,
    didOpentactIdentityID,
  ) {
    return this.entityManager
      .createQueryBuilder()
      .insert()
      .into(Did)
      .values({
        number: didNumber,
        status: didStatus,
        didOpentactID: didOpentactID,
        userID: userID,
        companyID: companyID,
        didOpentactIdentityID: didOpentactIdentityID,
      })
      .returning('*')
      .execute();
  }

  async addDidAfterBuying(userID, companyID, didStatus, didNumber) {
    let did = new Did();
    did.number = didNumber;
    did.status = didStatus;
    did.companyID = companyID;
    did.userID = userID;

    return await this.entityManager
      .createQueryBuilder()
      .insert()
      .into(Did)
      .values(did)
      .returning('*')
      .execute();
  }

  async isDidCreatedByThisUser(userID, companyID, id) {
    return this.entityManager
      .createQueryBuilder(Did, 'did')
      .where('did.userID=:userID', { userID: userID })
      .andWhere('did.companyID=:companyID', { companyID: companyID })
      .andWhere('did.id=:id', { id: id })
      .getOne();
  }

  async isDidCreatedByThisUserByNumber(userID, companyID, number) {
    return this.entityManager
      .createQueryBuilder(Did, 'did')
      .where('did.userID=:userID', { userID: userID })
      .andWhere('did.companyID=:companyID', { companyID: companyID })
      .andWhere('did.did_number=:number', { number: number })
      .getOne();
  }

  async disableEnableDid(id, enable) {
    return this.entityManager
      .createQueryBuilder()
      .update(Did)
      .set({
        status: enable,
      })
      .where('id=:id', { id })
      .returning('*')
      .execute();
  }

  async assignCallFlow(id, cfId) {
    return this.entityManager
      .createQueryBuilder()
      .update(Did)
      .set({
        cfId,
      })
      .where('id=:id', { id })
      .returning('*')
      .execute();
  }

  async getDidManagmentStatistics(orderBy, orderType, offset, limit, filter) {
    let manager = await this.entityManager;
    // let query = manager.createQueryBuilder(AccountNumber, "tn");
    let query = manager.createQueryBuilder(Did, 'did');
    if (!orderType || 'asc' === orderType) {
      // query.orderBy(`tn.${orderBy}`, "ASC");
      query.orderBy(`did.${orderBy}`, 'ASC');
    } else if (!orderType || 'desc' === orderType) {
      // query.orderBy(`tn.${orderBy}`, "DESC");
      query.orderBy(`did.${orderBy}`, 'DESC');
    }

    if (filter) {
      query.where('did.did_number like :number', { number: `%${filter}%` });
    }

    query.offset(offset);
    query.limit(limit);

    return await query.getManyAndCount();
  }

  async updateExpirationByNumbers(numbers, date) {
    return this.entityManager
      .createQueryBuilder()
      .update(Did)
      .set({
        expireOn: date,
      })
      .where('did.number IN (:numbers) ', { numbers })
      .returning('*')
      .execute();
  }

  async deleteDid(id, userID, compnayID) {
    return this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Did)
      .where('id=:id', { id: id })
      .andWhere('userID=:userID', { userID: userID })
      .andWhere('compnayID=:compnayID', { compnayID: compnayID })
      .returning('*')
      .execute();
  }

  async findNumberOwner(number: number) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(Did, 'did')
      .leftJoinAndSelect('did.user', 'user')
      .leftJoinAndSelect('did.company', 'company')
      .where('did.number = :number ')
      .setParameters({ number })
      .getOne();
  }

  async getDidNumbers(
    companyId: number,
    offset: number,
    limit: number,
    filterByNumber: any,
    order_by: string,
    order_dir: string,
  ) {
    const manager = await this.entityManager;
    const orderDir = order_dir == 'ASC' ? 'ASC' : 'DESC';
    const orderBy = order_by == 'number' ? 'did_number' : 'created_on';

    return manager
      .createQueryBuilder(Did, 'did')
      .offset(offset)
      .limit(limit)
      .where('did.company_id=:companyId', { companyId: companyId })
      .andWhere('did.did_status=:status', { status: true })
      .orderBy(`did.${orderBy}`, orderDir)
      .getMany();
  }
}
