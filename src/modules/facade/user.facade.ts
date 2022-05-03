import { User, Company, ApiKey, Invitation } from "../../models";
import { Injectable } from '@nestjs/common';
import { EmailService } from '../email';
import { Config } from '../../util/config';
import { PasswordHelper } from '../../util/helper';
import { genSaltSync, hashSync } from 'bcrypt';
import { v1, v4 } from 'uuid';
import { EntityRepository, EntityManager } from "typeorm";
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
import { OpentactService } from "../opentact/";
import { UserTypes } from "../../models/user.entity";
import constants from "../../constants";
import { errorMessagesConfig } from "../../util/error";
import { InvitationData, InvitationLogData } from '../../util/swagger/invitation_req';
import { InvitationLog } from '../../models/invitation_log';

@EntityRepository()
@Injectable()
export class UserFacade {

    constructor(
        private entityManager: EntityManager,
        private emailService: EmailService,
        private opentactService: OpentactService
    ) {
        // super()
    }

    static async getTokenForResetPassword(email) {
        let secret: string | any = constants.JWT_KEY;
        // process.env.JWT_KEY;
        return jwt.sign({
            email: email
        }, secret, { expiresIn: '1h' });
    }

    async getHashForResetPassword(email) {
        let hash = Math.floor(1000 + Math.random() * 9000);
        await this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                resetPasswordHash: `${hash}`
            })
            .where('email=:email', { email })
            .execute();

        return hash;
    }

    async deleteUserByUserUuid(userUuid) {
        return this.entityManager.createQueryBuilder()
            .delete()
            .from(User)
            .where('uuid=:userUuid', { userUuid: userUuid })
            .returning('*')
            .execute();
    }

    async updateUserActive(active: boolean, userID) {
        return await this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                active: active
            })
            .where('user_id=:id', { id: userID })
            .execute();
    }

    async getUserByUuid(userUuid) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user")
            .where("user.uuid = :uuid ")
            .setParameters({ uuid: userUuid })
            .getOne();
    }

    async findByEmail(email: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user")
            .where("user.email = :email ")
            .setParameters({ email: email })
            .getOne();
    }

    async findByHash(hash: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user")
            .where("user.reset_password_hash = :hash ")
            .setParameters({ hash })
            .getOne();
    }

    async findById(id) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(User, "user")
            .where("user.id = :id ")
            .setParameters({ id: id })
            .getOne();
    }

    async updatePassword(password: string, userUuid) {
        return this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                password: password,
                resetPasswordHash: ''
            })
            .where('uuid=:userUuid', { userUuid: userUuid })
            .execute();
    }

    async getAllCompaniesByUserId(userCreatorID) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Company, "c")
            .where('c.userCreatorID=:userCreatorID', { userCreatorID: userCreatorID })
            // .andWhere('c.accountID=:accountID', { accountID: accountID })
            .getMany();

    }

    async getCompanyByUserId(userCreatorID) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(Company, "c")
            .where('c.user_creator=:userCreatorID', { userCreatorID: userCreatorID })
            // .andWhere('c.acco_id=:accountID', { accountID: accountID })
            .getOne();
    }

    async resetPassword(email: string) {
        let user: any = await this.findByEmail(email);
        if (!user) throw new Error('auth:thisUserDoesNotExist');
        let hash = await this.getHashForResetPassword(email);
        this.emailService.sendMail("auth:resetPassword", user.email, {
            FIRST_NAME: user.firstName,
            LAST_NAME: user.lastName,
            HASH: hash,
            LINK: `${constants.FONIO_DOMAIN}/#/login?hash=${hash}`
        });
    }

    async updateUserLastLoginField(userID) {
        return await this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                userLastLogin: new Date()
            })
            .where('user_id=:id', { id: userID })
            .execute();
    }

    async signupUser(user: User, invitation?: Invitation) {
        try {
            if (invitation) {
                user.companyUuid = invitation.companyUuid;
                user.firstName = invitation.firstName;
                user.lastName = invitation.lastName;
                user.type = invitation.type;
            } else {
                user.type = UserTypes.COMPANY_ADMIN;
            }

            if (!user) throw new Error(errorMessagesConfig['auth:signup:missingInformation'].errorMessage);
            if (!user.firstName) throw new Error(errorMessagesConfig['auth:signup:missingFirstName'].errorMessage);
            if (!user.lastName) throw new Error(errorMessagesConfig['auth:signup:missingLastName'].errorMessage);
            if (!user.email) throw new Error(errorMessagesConfig['auth:signup:missingEmail'].errorMessage);
            if (!user.companyName && (!invitation || invitation?.type === UserTypes.COMPANY_ADMIN)) throw new Error(errorMessagesConfig['auth:signup:missignCompanyName'].errorMessage);
            if (!user.password) throw new Error(errorMessagesConfig['auth:signup:missingPassword'].errorMessage);
            if (!user.rePassword) throw new Error(errorMessagesConfig['auth:signup:missinRePassword'].errorMessage);
            if (user.password !== user.rePassword) throw new Error(errorMessagesConfig['auth:signup:passwordMatch'].errorMessage);

            await PasswordHelper.validatePassword(user.password);

            const found = await this.findByEmail(user.email);

            if (found) throw new Error(errorMessagesConfig['user:alreadyExists'].errorMessage);

            let company = new Company();
            user.uuid = v4();
            user.plaintText = true;
            user.invoiceEmail = false;
            user.active = true; // Email confirmed is not being used now;

            const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
            const sipPassword = user.password;
            const sipLogin = `${user.firstName}_${Date.now()}`;
            user.sipUsername = sipLogin;
            user.password = await hashSync(user.password, salt);
            user.emailConfirmed = true; // Email confirmed is not being used now
            user.salt = salt;
            user.userIdentityOpenTact = false;

            let companyResponse;
            // let company_uuid = v4();
            let userEntity = await user.save();

            if (user.companyName && (!invitation || invitation?.type === UserTypes.COMPANY_ADMIN)) {
                company.companyName = user.companyName;
                company.companyUuid = v4();
                company.userUuid = user.uuid
                company.userCreatorID = user.id;
                company.status = true;
                company.balance = 0;
                company.created = new Date();

                if (invitation) {
                    company.parentCompanyUuid = invitation.companyUuid;
                }

                companyResponse = await company.save();
            }

            const sipUser = await this.opentactService.createSipUser({
                login: sipLogin,
                password: sipPassword,
            });

            return {
                user: userEntity,
                company: companyResponse
            };
        } catch (err) {
            console.log(err)
            return { error: err.message }
            // throw err;
        }
    }

    async uploadedImageLinkToUserTable(link, userUuid) {
        return this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                link: link
            })
            .where('uuid=:userUuid', { userUuid: userUuid })
            .execute();
    }

    async deleteImageFromTable(userUuid) {
        return this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                link: undefined
            })
            .where('uuid=:userUuid', { userUuid: userUuid })
            .returning('*')
            .execute();
    }

    async deleteImageFromDisk(link, image_name) {
        if (fs.existsSync(`${link}/${image_name}`)) {
            fs.unlinkSync(`${link}/${image_name}`);
        }
    }

    async deleteImageFromDistPromise(link, image_name) {
        return await this.deleteImageFromDisk(link, image_name);
    }

    async getUserById(userId, companyId) {
        return await this.entityManager.createQueryBuilder(User, 'u')
            .where('u.id=:userId', { userId: userId })
            .andWhere('u.companyID=:companyId', { companyId: companyId })
            .getOne();
    }

    async getUserListByCompId(companyId) {
        return await this.entityManager.createQueryBuilder(User, 'u')
            .where('u.companyID=:companyId', { companyId: companyId }).getMany();
    }

    async getUserListByCompUuid(companyUuid) {
        return await this.entityManager.createQueryBuilder(User, 'u')
            .where('u.companyUuid=:companyUuid', { companyUuid: companyUuid })
            // .andWhere('u.accountID=:accountId', { accountId: currentUser.accountId })
            .getMany();
    }

    async updateUserFieldsEntity(userId, emailField, fn, ln, twoFA, password, machineDetection, forwardSoftphone, cn) {
        try {
            let body = new Object();
            body = {
                email: emailField,
                firstName: fn,
                lastName: ln,
                twoFA: twoFA,
                machineDetection: machineDetection,
                forwardSoftphone: forwardSoftphone,
                companyName: cn
            };
            if (password) {
                const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
                let pass = await hashSync(password, salt);
                body = {
                    email: emailField,
                    firstName: fn,
                    lastName: ln,
                    twoFA: twoFA,
                    machineDetection: machineDetection,
                    forwardSoftphone: forwardSoftphone,
                    password: pass,
                    salt: salt,
                    companyName: cn
                };
            }
            return this.entityManager.createQueryBuilder()
                .update(User)
                .set(body)
                .where('user_id=:userId', { userId })
                // .andWhere('account_id=:accountId', { accountId })
                .returning('*')
                .execute();
        } catch (e) {
            console.log(e);
            throw e;
        }


    }

    async saveApiKey(api_key) {
        let manager = await this.entityManager;
        return await manager.save(api_key);
    }

    async getAllApiKey(userCreatorID) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(ApiKey, "ak")
            .where('ak.user=:userCreatorID', { userCreatorID: userCreatorID })
            .getMany();

    }

    async unassignCompanyUsers(company_name) {
        let manager = await this.entityManager;
        return await manager.createQueryBuilder()
            .update(User)
            .set({ companyName: undefined })
            .where("companyName=:compName", { compName: company_name })
            .execute();
    }

    // Never used
    // async disableEnableUser(id, enable) {
    //     return this.entityManager.createQueryBuilder()
    //         .update(User)
    //         .set({
    //             status: enable
    //         })
    //         .where('id=:id', { id })
    //         .returning('*')
    //         .execute();
    // }

    async suspendUser(currentUser, token, apdiID, didID, trackingNumberID) {
        let manager = await this.entityManager;
        return await manager.transaction(async tEM => {
            if (trackingNumberID)
                await tEM.query("delete from tracking_numbers where id = $1", [trackingNumberID]);
            if (didID)
                await tEM.query("delete from did where did_id = $1", [didID]);
            // await tEM.query(`update account set acco_status = false where acco_id = ${currentUser.accountId}`);
            await tEM.query(`update "user" set email_confirmed = false where user_id = ${currentUser.userId}`);
            if (token && apdiID)
                await this.opentactService.releaseAppDid(token, apdiID);
        })
    }

    async closeUser(currentUser, token, apdiID, didID, trackingNumberID) {
        let manager = await this.entityManager;
        return await manager.transaction(async tEM => {
            if (trackingNumberID)
                await tEM.query("delete from tracking_numbers where id = $1", [trackingNumberID]);
            if (didID)
                await tEM.query("delete from did where did_id = $1", [didID]);
            // await tEM.query(`update account set acco_status = false where acco_id = ${currentUser.accountId}`);
            await tEM.query(`update "user" set email_confirmed = false where user_id = ${currentUser.userId}`);
            if (token && apdiID)
                await this.opentactService.releaseAppDid(token, apdiID);
        })
    }

    async updateStatus(id, status) {
        return this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                emailConfirmed: status
            })
            .where('user_id=:id', { id: id })
            .returning('*')
            .execute();

    }

    async updateUserByAdmin(id, status, companyName) {
        return await this.entityManager.createQueryBuilder()
            .update(User)
            .set({
                active: status,
                companyName: companyName
            })
            .where('user_id=:id', { id: id })
            .returning('*')
            .execute();

    }

    async getInvitationByUuid(uuid: string) {
        return await this.entityManager.createQueryBuilder(Invitation, 'inv')
            .where('inv.uuid = :uuid', { uuid })
            .getOne();
    }

    public async storeInvitationLogData(data: InvitationLogData) {
        const invitationLog = new InvitationLog();

        invitationLog.invitationUuid = data.invitationId;
        invitationLog.firstName = data.firstName;
        invitationLog.lastName = data.lastName;
        invitationLog.email = data.email;
        invitationLog.companyUuid = data.companyUuid;
        invitationLog.expiredAt = new Date(Date.now() + 60 * 60 * 24 * 1000);

        return await invitationLog.save();
    }

    async getInvitationLogByUuid(uuid: string) {
        return await this.entityManager.createQueryBuilder(InvitationLog, 'invLog')
          .where('invLog.invitationUuid = :uuid', { uuid })
          .getOne();
    }

    async insertUser(data) {
        const user = new User();

        const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
        user.password = await hashSync(user.password, salt);

        user.firstName = data.firstName;
        user.lastName = data.lastName;
        user.email = data.email;

        return await user.save();
    }

    async updateInvitationLog(uuid: string) {
        return await this.entityManager.createQueryBuilder(InvitationLog, 'invLog')
          .update(InvitationLog, {acceptedOn: `${new Date()}`})
          .where('invLog.invitationUuid = :uuid', { uuid })
          .execute();
    }

    // async cancelAccount(account_Id) {
    //     try {
    //         let removed_tn_leases: any,
    //             numbers_array: Array<number> = [],
    //             user_account = await this.entityManager.createQueryBuilder()
    //                 .update(Account)
    //                 .set({
    //                     status: false,
    //                 })
    //                 .where('account.acco_status = true')
    //                 .andWhere('account.acco_id=:account_Id', { account_Id })
    //                 .returning('*')
    //                 .execute();

    //         if (user_account.affected) {
    //             numbers_array = (await this.entityManager.query(`select array(select number from tracking_numbers where acco_id=$1)`,
    //                 [account_Id]))[0].array;

    //             if (numbers_array.length) {
    //                 removed_tn_leases = await this.opentactService.removeTNLeases(numbers_array)
    //             }
    //         }

    //         return {
    //             message: 'Account was canceled successfuly.',
    //             user_account,
    //             numbers_array,
    //             removed_tn_leases
    //         }
    //     } catch (err) {
    //         console.log(err)
    //         return { error: err.message }
    //     }

    // }
}
