import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EntityRepository, EntityManager } from 'typeorm';
const CryptoJS = require('crypto-js');
import { v4 } from 'uuid';
import { Company, Contact, Invitation, User, UserTypes } from '../../models';
import { BaseService } from '../services/base.service';
import { Repositories } from '../db/repositories';
import { UserFacade } from './user.facade';
import { HelperClass } from '../../filters/Helper';
import { InvitationData } from '../../util/swagger/invitation_req';
import constants from '../../constants';

@EntityRepository()
@Injectable()
export class CompanyFacade extends BaseService {
  constructor(
    private readonly Repositories: Repositories,
    private entityManager: EntityManager,
    private userFacade: UserFacade,
  ) {
    super();
  }

  async getCompanyByUuid(companyUuid) {
    return await this.entityManager
      .createQueryBuilder(Company, 'c')
      .where('c.companyUuid=:companyUuid', { companyUuid: companyUuid })
      .getOne();
  }

  async getCompanyById(id) {
    return await this.entityManager
      .createQueryBuilder(Company, 'c')
      .where('c.companyID=:id', { id: id })
      .getOne();
  }

  async getCompanyByUserCreatorId(userCreatorId) {
    return await this.entityManager
      .createQueryBuilder(Company, 'c')
      .where('c.userCreatorID=:userCreatorID', { userCreatorID: userCreatorId })
      .getOne();
  }

  //  async getCompanyById(userCreatorId, id) {
  //    const company = await this.entityManager
  //      .createQueryBuilder(Company, 'c')
  //      .where('c.companyID=:id', { id: id })
  //      .andWhere('c.userCreatorID=:userCreatotId', {
  //        userCreatotId: userCreatorId,
  //      })
  //      .getOne();

  //    const user = await this.entityManager
  //      .createQueryBuilder(User, 'u')
  //      .where('u.id=:id', { id: userCreatorId })
  //      .getOne();

  //    if (user) {
  //      user.password = undefined;
  //      user.salt = undefined;
  //    }

  //    return { company, user };
  //  }

  async getCompanyByName(companyName) {
    return this.entityManager
      .createQueryBuilder(Company, 'c')
      .where('c.companyName=:name', { name: companyName })
      .getOne();
  }

  async getUserByEmail(email: string) {
    return await this.userFacade.findByEmail(email);
  }

  async getUserListByCompUuidByRole(companyUuid, orderBy?, orderType?, role?) {
    let by;
    if (orderBy === 'created') by = 'creation';

    let request = this.entityManager
      .createQueryBuilder(User, 'u')
      .where('u.companyUuid=:companyUuid', { companyUuid: companyUuid });
    if (role) {
      request.andWhere('u.type=:type', { type: role });
    }
    if (by) {
      request.orderBy(`u.${by}`, orderType === 'asc' ? 'ASC' : 'DESC');
    }

    return await request.getMany();
  }

  //  async getCompanyListByParentCompanyUuid(companyUuid) {
  //    return await this.entityManager
  //      .createQueryBuilder(Company, 'c')
  //      .where('c.parentCompanyUuid=:companyUuid', { companyUuid: companyUuid })
  //      .getMany();
  //  }

  async getUserUuidByCompanyUuid(companyUuid, userUuid) {
    return await this.entityManager
      .createQueryBuilder(User, 'u')
      .where('u.companyUuid=:companyUuid', { companyUuid: companyUuid })
      .andWhere('u.uuid=:userUuid', { userUuid: userUuid })
      .getOne();
  }

  async updateCompanyUser(companyUuid, userUuid, user) {
    await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        ...user,
      })
      .where('companyUuid=:companyUuid', { companyUuid: companyUuid })
      .andWhere('uuid=:userUuid', { userUuid: userUuid })
      .execute();

    return await this.userFacade.getUserByUuid(userUuid);
  }

  async getAllCompaniesByUserCreator(userId, companyUuid?) {
    let manager = await this.entityManager;
    let query1 = `SELECT count(*) FROM "public"."company"
                    WHERE "company"."user_creator"=${userId}`;
    if (companyUuid) {
      query1 += ` or "company"."comp_uuid"='${companyUuid}'`;
    }

    let count = await manager.query(query1);

    let query2 = `SELECT "company"."comp_id" AS "company_comp_id", "company"."user_creator" AS "company_user_creator", 
                    "company"."comp_name" AS "company_comp_name",
                    "company"."comp_uuid" AS "company_comp_uuid", "company"."status" AS "company_status", 
                    "company"."balance" AS "company_balance", to_char("company"."created", 'YYYY-MM-DD') AS "company_created", 
                    "company"."identity_uuid" AS "company_identity_uuid", "company"."user_uuid" AS "company_user_uuid",
                    "company"."timezone" AS "company_timezone", "company"."notification" AS "company_notification" FROM "public"."company" 
                    WHERE "company"."user_creator" = ${userId}`;

    if (companyUuid) {
      query2 += ` or "company"."comp_uuid" = '${companyUuid}'`;
    }

    let result = await manager.query(query2);

    return { result, count: Number(count[0].count) };
  }

  async getCompanyContacts(comp_id, id?, options?) {
    let query = this.entityManager
      .createQueryBuilder(Contact, 'contact')
      .leftJoinAndSelect('contact.assignedTo', 'user')
      .where('contact.comp_id=:comp_id', { comp_id });

    if (options?.userUuid) {
      query.andWhere('user.uuid=:userUuid', { userUuid: options.userUuid });
    }

    if (options?.firstName) {
      query.andWhere('LOWER(contact.firstName) like :name', {
        name: `${options.firstName.toLowerCase()}%`,
      });
    }

    if (id) {
      query.andWhere('contact.cont_id=:id', { id });
    }

    return await query.getMany();
  }

  async deleteCompanyContacts(comp_id, id) {
    return await this.entityManager
      .createQueryBuilder()
      .delete()
      .from(Contact)
      .where('contacts.comp_id=:comp_id', { comp_id })
      .andWhere('contacts.cont_id=:id', { id })
      .returning('*')
      .execute();
  }

  async assignUserContact(userId, creator_id, company_id, contact_req) {
    let contact = new Contact();
    contact.email = contact_req.email;
    contact.phoneNumber = contact_req.phoneNumber;
    contact.firstName = contact_req.firstName;
    contact.lastName = contact_req.lastName;
    contact.createdOn = new Date();
    contact.lastModified = new Date();
    contact.active = contact_req.active;
    contact.modifiedBy = creator_id;
    contact.assignedTo = User.withId(userId);
    contact.company = Company.withId(company_id);
    contact.favourite = contact_req.favourite;
    return await this.entityManager.save(contact);
  }

  async reassignUserContact(userId, creator_id, contact_id, company_id) {
    return await this.entityManager
      .createQueryBuilder()
      .update(Contact)
      .set({
        modifiedBy: creator_id,
        assignedTo: User.withId(userId),
      })
      .where('contacts.cont_id=:contact_id', { contact_id })
      .andWhere('contacts.comp_id=:company_id', { company_id })
      .returning('*')
      .execute();
  }

  async UpdateCompanyContact(user_id, comp_id, cont_id, contact_req) {
    let contact: any = {};

    if (contact_req.email) contact.email = contact_req.email;
    if (contact_req.phoneNumber) contact.phoneNumber = contact_req.phoneNumber;
    if (contact_req.firstName) contact.firstName = contact_req.firstName;
    if (contact_req.lastName) contact.lastName = contact_req.lastName;
    if (contact_req.hasOwnProperty('active'))
      contact.active = contact_req.active;
    if (contact_req.hasOwnProperty('favourite'))
      contact.favourite = contact_req.favourite;
    contact.lastModified = new Date();
    contact.modifiedBy = user_id;

    return await this.entityManager
      .createQueryBuilder()
      .update(Contact)
      .set(contact)
      .where('contacts.cont_id=:cont_id', { cont_id })
      .andWhere('contacts.comp_id=:comp_id', { comp_id })
      .returning('*')
      .execute();
  }

  async deleteUserCompany(compId: number, userId: number) {
    let manager = await this.entityManager;
    manager.query(
      'delete from user_company where user_id = $1 and comp_id = $2',
      [userId, compId],
    );
  }

  async createCompany(user, body, identityUuid) {
    let status = body.status ? body.status : false;
    let balance = body.balance ? body.balance : 0;
    let manager = await this.entityManager;
    await manager
      .createQueryBuilder()
      .insert()
      .into(Company)
      .values({
        companyUuid: await v4(),
        // accountID: user.accountId,
        companyName: user.companyName,
        userCreatorID: user.id,
        status: status,
        balance: balance,
        created: new Date(),
        identityUuid: identityUuid,
        timezone: body.zone,
        userUuid: user.uuid,
      })
      .execute();
    return await manager
      .createQueryBuilder(Company, 'c')
      .where('c.companyName=:companyName', { companyName: user.companyName })
      .andWhere('c.userCreatorID=:userCreatorID', {
        userCreatorID: user.id,
      })
      .getOne();
  }

  async isCompanyExistByCompanyName(companyName, userCreatorID) {
    let manager = await this.entityManager;
    return await manager
      .createQueryBuilder(Company, 'company')
      .where('company.companyName=:companyName', { companyName: companyName })
      .andWhere('company.userCreatorID=:userCreatorID', {
        userCreatorID: userCreatorID,
      })
      .getOne();
  }

  async isCompanyExistByCompanyUuid(companyUuid) {
    let manager = await this.entityManager;
    return await manager
      .createQueryBuilder(Company, 'company')
      .where('company.companyUuid=:companyUuid', { companyUuid: companyUuid })
      .getOne();
  }

  async addUsers(uuids, comp_name) {
    let manager = await this.entityManager;
    return await manager.transaction(async (tEM) => {
      for (const uuid of uuids) {
        let user = await this.userFacade.getUserByUuid(uuid);
        if (!user) {
          await HelperClass.throwErrorHelper('user:userWithThisUuidIsNotExist');
        } else {
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
    return await this.entityManager
      .createQueryBuilder()
      .update(Company)
      .set({
        ...company,
      })
      .returning('*')
      .execute();
  }

  async updateStatus(id, status) {
    return this.entityManager
      .createQueryBuilder()
      .update(Company)
      .set({
        status: status,
      })
      .where('comp_id=:id', { id: id })
      .returning('*')
      .execute();
  }

  async updateNotificationStatus(
    uuid,
    remove_number_notification: boolean,
    add_number_notification: boolean,
  ) {
    return this.entityManager
      .createQueryBuilder()
      .update(Company)
      .set({
        remove_number_notification,
        add_number_notification,
      })
      .where('comp_uuid=:uuid', { uuid: uuid })
      .returning('*')
      .execute();
  }

  async updateNotice(uuid, notice: string) {
    return this.entityManager
      .createQueryBuilder()
      .update(Company)
      .set({
        notice,
      })
      .where('comp_uuid=:uuid', { uuid: uuid })
      .returning('*')
      .execute();
  }

  public async saveToken(
    login: string,
    password: string,
    user: User,
  ): Promise<unknown> {
    const domain = constants.OPENTACT_SIP_DOMAIN;
    const ha1 = CryptoJS.MD5(`${login}:${domain}:${password}`).toString();
    const ha1b = CryptoJS.MD5(
      `${login}@${domain}:${domain}:${password}`,
    ).toString();
    return await this.createEntity(this.Repositories.TOKEN, {
      user,
      ha1,
      ha1b,
    });
  }

  public async storeInvitationData(data: InvitationData) {
    const invitation = new Invitation();

    invitation.uuid = v4();
    invitation.firstName = data.firstName;
    invitation.lastName = data.lastName;
    invitation.email = data.email;
    invitation.companyUuid = data.companyUuid;
    invitation.type = data.type
      ? UserTypes.COMPANY_ADMIN
      : UserTypes.COMPANY_USER;
    invitation.expiredOn = new Date(Date.now() + 24 * 3600 * 1000);

    return await invitation.save();
  }

  async getInvitationByUuid(uuid: string) {
    return await this.entityManager
      .createQueryBuilder(Invitation, 'inv')
      .where('inv.uuid = :uuid', { uuid })
      .getOne();
  }

  async getInvitationByEmail(email: string) {
    return await this.entityManager
      .createQueryBuilder(Invitation, 'inv')
      .where('inv.email = :email', { email })
      .orderBy('inv.id ', 'DESC')
      .getOne();
  }

  public async updateInvitationData(data: Invitation) {
    const invitation = data;
    invitation.acceptedOn = new Date();

    return await invitation.save();
  }

  async updateUserPurged(companyUuid, userUuid) {
    await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        purged: false,
      })
      .where('companyUuid=:companyUuid', { companyUuid: companyUuid })
      .andWhere('uuid=:userUuid', { userUuid: userUuid })
      .execute();

    return await this.userFacade.getUserByUuid(userUuid);
  }
}
