import { Contact, User } from "../../models";
import { Injectable } from '@nestjs/common';
import { CompanyFacade } from '../facade/company.facade';
import {HelperClass} from "../../filters/Helper";
import {ContactReq} from "../../util/swagger/contact_req";

import { EntityRepository, EntityManager } from "typeorm";

@EntityRepository()
@Injectable()
export class ContactFacade {

    constructor(private entityManager: EntityManager,
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
        if (!currentUser.companyUuid) await HelperClass.throwErrorHelper('user:thisUserIsNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByUuid(currentUser.companyUuid);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoesNotExist');
        let contact = new Contact();
        contact.email = contact_req.email;
        contact.phoneNumber = contact_req.phoneNumber;
        contact.firstName = contact_req.firstName;
        contact.lastName = contact_req.lastName;
        contact.createdOn = new Date();
        contact.lastModified = new Date();
        contact.active = contact_req.active;
        contact.modifiedBy = currentUser.userId;
        contact.assignedTo = User.withId(currentUser.userId);
        contact.favourite = contact_req.favourite;
        // contact.modifiedBy = User.withId(currentUser.userId);
        if (company)        
            contact.company = company;
        let manager = await this.entityManager;
        return await manager.save(contact);

    }

    async edit(currentUser, id, contact_req: ContactReq) {
        if (!currentUser.companyUuid) await HelperClass.throwErrorHelper('user:thisUserIsNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByUuid(currentUser.companyUuid);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoesNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            else  {
                contact.phoneNumber = contact_req.phoneNumber;
                contact.firstName = contact_req.firstName;
                contact.lastName = contact_req.lastName;
                contact.lastModified = new Date();
                contact.active = contact_req.active;
                contact.modifiedBy = currentUser.userId;
                contact.favourite = currentUser.favourite;
                // contact.modifiedBy = User.withId(currentUser.userId);
                let manager = await this.entityManager;
                return await manager.save(contact);
            }
        }
    }

    async get(currentUser, id) {
        if (!currentUser.companyUuid) await HelperClass.throwErrorHelper('user:thisUserIsNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByUuid(currentUser.companyUuid);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoesNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            else
                return contact;
        }
    }

    async getList(currentUser) {
        if (!currentUser.companyUuid) await HelperClass.throwErrorHelper('user:thisUserIsNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByUuid(currentUser.companyUuid);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoesNotExist');
        else {
            return await this.findByCompId(company.companyID);
        }
    }

    async delete(currentUser, id) {
        if (!currentUser.companyUuid) await HelperClass.throwErrorHelper('user:thisUserIsNotAssinedToCompany');
        let company = await this.companyFacade.getCompanyByUuid(currentUser.companyUuid);
        if (!company) await HelperClass.throwErrorHelper('company:CompanyDoesNotExist');
        else {
            let contact = await this.findById(company.companyID, id);
            if (!contact) await HelperClass.throwErrorHelper('contact:ContactDoNotExist');
            let manager = await this.entityManager;
            return manager.query("delete from contacts where comp_id=$1 and cont_id=$2", [company.companyID, id])
        }
    }
}