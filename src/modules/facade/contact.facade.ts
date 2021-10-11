import { Contact, User } from "../../models";
import { Injectable } from '@nestjs/common';
import { UserFacade } from '../facade/user.facade';
import { CompanyFacade } from '../facade/company.facade';
import {HelperClass} from "../../filters/Helper";
import {ContactReq} from "../../util/swagger/contact_req";

import { EntityRepository, EntityManager } from "typeorm";

@EntityRepository()
@Injectable()
export class ContactFacade {

    constructor(private entityManager: EntityManager,
                private userFacade: UserFacade,
                private companyFacade: CompanyFacade) { }

    async findById(compId: number, contId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Contact, "cont")
            .leftJoinAndSelect("cont.company", "company")
            .where("company.comp_id = :compId ")
            .andWhere("cont.id = :contId ")
            .setParameters({ compId, contId })
            .getOne();
    }

    async findByCompId(compId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Contact, "cont")
            .leftJoinAndSelect("cont.company", "company")
            .where("company.comp_id = :compId ")
            .setParameters({ compId })
            .getManyAndCount();
    }

    async create(currentUser, contact_req: ContactReq) {
        let user: any = await this.userFacade.getUserById(currentUser.userId, currentUser.accountId);
        if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
        if (!user.companyName) await HelperClass.throwErrorHelper('user:thisUSerDoNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByName(user.companyName);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoNotExist');
        let contact = new Contact();
        contact.phoneNumber = contact_req.phoneNumber;
        contact.firstName = contact_req.firstName;
        contact.lastName = contact_req.lastName;
        contact.createdOn = new Date();
        contact.lastModified = new Date();
        contact.active = contact_req.active;
        contact.modifiedBy = User.withId(currentUser.userId);
        if (company)        
            contact.company = company;
        let manager = await this.entityManager;
        return await manager.save(contact);

    }

    async edit(currentUser, id, contact_req: ContactReq) {
        let user: any = await this.userFacade.getUserById(currentUser.userId, currentUser.accountId);
        if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
        if (!user.companyName) await HelperClass.throwErrorHelper('user:thisUSerDoNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByName(user.companyName);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            else  {
                contact.phoneNumber = contact_req.phoneNumber;
                contact.firstName = contact_req.firstName;
                contact.lastName = contact_req.lastName;
                contact.lastModified = new Date();
                contact.active = contact_req.active;
                contact.modifiedBy = User.withId(currentUser.userId);
                let manager = await this.entityManager;
                return await manager.save(contact);
            }
        }
    }

    async get(currentUser, id) {
        let user: any = await this.userFacade.getUserById(currentUser.userId, currentUser.accountId);
        if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
        if (!user.companyName) await HelperClass.throwErrorHelper('user:thisUSerDoNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByName(user.companyName);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            else
                return contact;
        }
    }

    async getList(currentUser) {
        let user: any = await this.userFacade.getUserById(currentUser.userId, currentUser.accountId);
        if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
        if (!user.companyName) await HelperClass.throwErrorHelper('user:thisUSerDoNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByName(user.companyName);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoNotExist');
        else {
            return await this.findByCompId(company.companyID);
        }
    }

    async delete(currentUser, id) {
        let user: any = await this.userFacade.getUserById(currentUser.userId, currentUser.accountId);
        if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
        if (!user.companyName) await HelperClass.throwErrorHelper('user:thisUSerDoNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByName(user.companyName);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            let manager = await this.entityManager;
            return manager.query("delete from contacts where comp_id=$1 and cont_id=$2", [company.companyID, id])
        }
    }
}