import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { EntityRepository, EntityManager } from 'typeorm';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import { genSaltSync, hashSync } from 'bcrypt';
import { v4 } from 'uuid';
import { User, UserTypes, Company, ApiKey } from '../../models';
import { EmailService } from '../email';
import { Config } from '../../util/config';
import { OpentactService } from '../opentact/';
import constants from '../../constants';
import { PasswordHelper } from '../../util/helper';
import { errorMessagesConfig } from '../../util/error';
import { CompanyFacade } from './company.facade';

@EntityRepository()
@Injectable()
export class UserFacade {
  constructor(
    private entityManager: EntityManager,
    private emailService: EmailService,
    private opentactService: OpentactService,
    @Inject(forwardRef(() => CompanyFacade))
    private companyFacade: CompanyFacade,
  ) {
    //  super();
  }

  static async getTokenForResetPassword(email) {
    let secret: string | any = constants.JWT_KEY;
    // process.env.JWT_KEY;
    return jwt.sign(
      {
        email: email,
      },
      secret,
      { expiresIn: '1h' },
    );
  }

  async getHashForResetPassword(email) {
    let hash = Math.floor(1000 + Math.random() * 9000);
    await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        resetPasswordHash: `${hash}`,
      })
      .where('email=:email', { email })
      .execute();

    return hash;
  }

  async deleteUserByUserUuid(userUuid) {
    return this.entityManager
      .createQueryBuilder()
      .delete()
      .from(User)
      .where('uuid=:userUuid', { userUuid: userUuid })
      .returning('*')
      .execute();
  }

  async updateUserActive(active: boolean, userID) {
    return await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        active: active,
      })
      .where('user_id=:id', { id: userID })
      .execute();
  }

  async getUserByUuid(userUuid) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(User, 'user')
      .where('user.uuid = :uuid ')
      .setParameters({ uuid: userUuid })
      .getOne();
  }

  async findByEmail(email: string) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(User, 'user')
      .where('user.email = :email ')
      .setParameters({ email: email })
      .getOne();
  }

  async findByHash(hash: string) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(User, 'user')
      .where('user.reset_password_hash = :hash ')
      .setParameters({ hash })
      .getOne();
  }

  async findById(id) {
    let manager = await this.entityManager;
    return manager
      .createQueryBuilder(User, 'user')
      .where('user.id = :id ')
      .setParameters({ id: id })
      .getOne();
  }

  async updatePassword(password: string, userUuid) {
    return this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        password: password,
        resetPasswordHash: '',
      })
      .where('uuid=:userUuid', { userUuid: userUuid })
      .execute();
  }

  async getAllCompaniesByUserId(userCreatorID) {
    let manager = await this.entityManager;
    return (
      manager
        .createQueryBuilder(Company, 'c')
        .where('c.userCreatorID=:userCreatorID', {
          userCreatorID: userCreatorID,
        })
        // .andWhere('c.accountID=:accountID', { accountID: accountID })
        .getMany()
    );
  }

  async getCompanyByUserId(userCreatorID) {
    let manager = await this.entityManager;
    return (
      manager
        .createQueryBuilder(Company, 'c')
        .where('c.user_creator=:userCreatorID', {
          userCreatorID: userCreatorID,
        })
        // .andWhere('c.acco_id=:accountID', { accountID: accountID })
        .getOne()
    );
  }

  async resetPassword(email: string) {
    let user: any = await this.findByEmail(email);
    if (!user) throw new Error('auth:thisUserDoesNotExist');
    let hash = await this.getHashForResetPassword(email);
    this.emailService.sendMail('auth:resetPassword', user.email, {
      FIRST_NAME: user.firstName,
      LAST_NAME: user.lastName,
      HASH: hash,
      LINK: `${constants.FONIO_DOMAIN}/#/login?hash=${hash}`,
    });
  }

  async updateUserLastLoginField(userID) {
    return await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        userLastLogin: new Date(),
      })
      .where('user_id=:id', { id: userID })
      .returning('user_last_login')
      .execute();
  }

  async signupUser(userData: User) {
    try {
      const user = new User();
      user.email = userData.email;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.companyName = userData.companyName;
      user.userPhone = userData.userPhone;
      user.type = UserTypes.COMPANY_ADMIN;
      user.isAdmin = true;
      user.password = userData.password;
      const salt = genSaltSync(Config.number('BCRYPT_SALT_ROUNDS', 10));
      user.password = await hashSync(user.password, salt);
      user.salt = salt;
      user.uuid = v4();
      user.emailConfirmed = true; // Email confirmed is not being used now
      user.userIdentityOpenTact = false;
      user.plaintText = true;
      user.invoiceEmail = false;
      user.active = true; // Email confirmed is not being used now;
      const sipLogin = `${user.firstName}_${user.uuid}`;
      user.sipUsername = sipLogin;
      const sipPassword = userData.password;
      const sipUser = await this.opentactService.createSipUser({
        login: sipLogin,
        password: sipPassword,
      });

      if (sipUser.success) {
        user.sipUserUuid = sipUser.payload.uuid;
      }

      const userEntity = await user.save();

      const company = await this.companyFacade.createCompany(
        userEntity,
        { status: false, balance: 0 },
        false,
      );
      //const company = new Company();

      //company.companyName = user.companyName;
      //company.companyUuid = v4();
      //company.userUuid = user.uuid;
      //company.status = true;
      //company.balance = 0;
      //company.created = new Date();
      //company.userCreatorID = userEntity.id;
      //const companyEntity = await company.save();
      if (company) {
        await this.entityManager
          .createQueryBuilder()
          .update(User)
          .set({
            companyUuid: company.companyUuid,
            companyID: company.companyID,
          })
          .where('id=:user_id', { user_id: userEntity.id })
          .execute();
      }
		
      return {
        user: userEntity,
        company: company,
      };
    } catch (err) {
      console.log(err);
      return { error: err.message };
    }
  }

  @Transactional()
  async createUser(userData, company: Company, role?) {
    try {
      const found = await this.findByEmail(userData.email);

      if (found) {
        throw new Error('user:alreadyExists');
      }

      if (userData.password !== userData.rePassword) {
        throw new Error(
          errorMessagesConfig['auth:signup:passwordMatch'].errorMessage,
        );
      }

      const user = new User();
      user.email = userData.email;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      user.password = userData.password;
      user.userPhone = userData?.userPhone;
      user.type =
        role === UserTypes.COMPANY_ADMIN
          ? UserTypes.COMPANY_ADMIN
          : UserTypes.COMPANY_USER;
      await PasswordHelper.validatePassword(user.password);
      const salt = genSaltSync(Config.number('BCRYPT_SALT_ROUNDS', 10));
      user.password = await hashSync(user.password, salt);
      user.salt = salt;
      user.uuid = v4();
      user.emailConfirmed = true;
      user.userIdentityOpenTact = false;
      user.plaintText = true;
      user.invoiceEmail = false;
      user.active = true;

      const sipLogin = `${user.firstName}_${user.uuid}`;
      user.sipUsername = sipLogin;
      const sipPassword = userData.password;
      const sipUser = await this.opentactService.createSipUser({
        login: sipLogin,
        password: sipPassword,
      });

      if (sipUser.success) {
        user.sipUserUuid = sipUser.payload.uuid;
      }

      user.companyID = company.companyID;
      user.companyUuid = company.companyUuid;
      user.companyName = company.companyName;

      const userEntity = await user.save();

      // if (userData.password) {
      //   const createdTokens = await this.saveToken(
      //     login,
      //     userData.password,
      //     userEntity,
      //   );
      // }

      return {
        user: userEntity,
        company: company,
      };
    } catch (err) {
      console.log(err);
      return { error: err.message };
    }
  }

  async uploadedImageLinkToUserTable(link, userUuid) {
    return this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        link: link,
      })
      .where('uuid=:userUuid', { userUuid: userUuid })
      .execute();
  }

  async deleteImageFromTable(userUuid) {
    return this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        link: undefined,
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
    return await this.entityManager
      .createQueryBuilder(User, 'u')
      .where('u.id=:userId', { userId: userId })
      .andWhere('u.companyID=:companyId', { companyId: companyId })
      .getOne();
  }

  async getUserListByCompId(companyId) {
    return await this.entityManager
      .createQueryBuilder(User, 'u')
      .where('u.companyID=:companyId', { companyId: companyId })
      .getMany();
  }

  async getUserListByCompUuid(companyUuid) {
    return await this.entityManager
      .createQueryBuilder(User, 'u')
      .where('u.companyUuid=:companyUuid', { companyUuid: companyUuid })
      // .andWhere('u.accountID=:accountId', { accountId: currentUser.accountId })
      .getMany();
  }

  async updateUserFieldsEntity(
    userId,
    emailField,
    fn,
    ln,
    twoFA,
    password,
    machineDetection,
    forwardSoftphone,
    cn,
  ) {
    try {
      let body = new Object();
      body = {
        email: emailField,
        firstName: fn,
        lastName: ln,
        twoFA: twoFA,
        machineDetection: machineDetection,
        forwardSoftphone: forwardSoftphone,
        companyName: cn,
      };
      if (password) {
        const salt = genSaltSync(Config.number('BCRYPT_SALT_ROUNDS', 10));
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
          companyName: cn,
        };
      }
      return (
        this.entityManager
          .createQueryBuilder()
          .update(User)
          .set(body)
          .where('user_id=:userId', { userId })
          // .andWhere('account_id=:accountId', { accountId })
          .returning('*')
          .execute()
      );
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
    return manager
      .createQueryBuilder(ApiKey, 'ak')
      .where('ak.user=:userCreatorID', { userCreatorID: userCreatorID })
      .getMany();
  }

  async unassignCompanyUsers(company_name) {
    let manager = await this.entityManager;
    return await manager
      .createQueryBuilder()
      .update(User)
      .set({ companyName: undefined })
      .where('companyName=:compName', { compName: company_name })
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
    return await manager.transaction(async (tEM) => {
      if (trackingNumberID)
        await tEM.query('delete from tracking_numbers where id = $1', [
          trackingNumberID,
        ]);
      if (didID) await tEM.query('delete from did where did_id = $1', [didID]);
      // await tEM.query(`update account set acco_status = false where acco_id = ${currentUser.accountId}`);
      await tEM.query(
        `update "user" set email_confirmed = false where user_id = ${currentUser.userId}`,
      );
      if (token && apdiID)
        await this.opentactService.releaseAppDid(token, apdiID);
    });
  }

  async closeUser(currentUser, token, apdiID, didID, trackingNumberID) {
    let manager = await this.entityManager;
    return await manager.transaction(async (tEM) => {
      if (trackingNumberID)
        await tEM.query('delete from tracking_numbers where id = $1', [
          trackingNumberID,
        ]);
      if (didID) await tEM.query('delete from did where did_id = $1', [didID]);
      // await tEM.query(`update account set acco_status = false where acco_id = ${currentUser.accountId}`);
      await tEM.query(
        `update "user" set email_confirmed = false where user_id = ${currentUser.userId}`,
      );
      if (token && apdiID)
        await this.opentactService.releaseAppDid(token, apdiID);
    });
  }

  async updateStatus(id, status) {
    return this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        emailConfirmed: status,
      })
      .where('user_id=:id', { id: id })
      .returning('*')
      .execute();
  }

  async updateUserByAdmin(id, status, companyName) {
    return await this.entityManager
      .createQueryBuilder()
      .update(User)
      .set({
        active: status,
        companyName: companyName,
      })
      .where('user_id=:id', { id: id })
      .returning('*')
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
