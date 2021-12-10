'use strict';

import { Injectable } from '@nestjs/common';
import { JWTHelper } from '../../util/jwt';
import { UserFacade, PlanFacade } from '../facade';
import { User, ApiKey } from '../../models';
import { compare as comparePassword } from 'bcrypt';
import { OpentactService } from '../opentact';
import { HelperClass } from "../../filters/Helper";
import { BaseService } from '../services/base.service';
import { OpentactAuth } from '../opentact';

@Injectable()
export class AuthService extends BaseService {

    constructor(
    private userFacade: UserFacade,
        private opentactAuth: OpentactAuth,
        private opentactService: OpentactService,
        private planFacade: PlanFacade,
    ) {
        super()
    }

    static async generateToken(user: User, remoteAddress: string, userAgent, nonce: string, isAdmin, opentactToken, userUuid: any, isActive: boolean) {
        let token = await JWTHelper.sign({
            // accountId: user.accountID,
            companyId: user.companyID,
            userFirstName: user.firstName,
            userLastName: user.lastName,
            userEmail: user.email,
            active: isActive,
            remoteAddress: remoteAddress,
            userAgent: userAgent,
            nonce: nonce,
            // accountNumber: account.number,
            userId: user.id,
            opentactToken: opentactToken,
            userType: user.type,
            is_admin: isAdmin,
            userUuid: userUuid,
            companyUuid: user.companyUuid,
        });
        if (!token) throw new Error('user:tokenError');
        return token;
    }

    static response(user, company): SignInResponse {
        return {
            user: user,
            // account: account,
            company: company
        };
    }

    public async signIn(credentials: any, remoteAddress: string, userAgent, onSignUp: boolean = false): Promise<SignInResponse> {
        const user: any = await this.userFacade.findByEmail(credentials.email);
        if (!user) throw new Error('user:userDoesNotExist');
        // const account: any = await this.userFacade.findAccountByAccountId(user.accountID);
        // if (!user) throw new Error('user:accountDoNotExistForThisUser');
        // if (!user) throw new Error('user:notFound');
        if (!user.active) throw new Error('user:userInactivated');
        // if (!account.status) throw new Error('account:planIsNotPaid');
        if (!user.emailConfirmed) throw new Error('user:emailIsNotConfirmed');
        const equals = await comparePassword(credentials.password, user.password ? user.password : '');
        if (!equals && !onSignUp) throw new Error('user:incorrectPassword');
        let isAdmin = (user.isAdmin) ? user.isAdmin : false;
        let opentactToken = (isAdmin) ? 'admintoken123456789' : 'usertoken123456789';
        let company = await this.userFacade.getAllCompaniesByUserId(user.id);
        user.token = await AuthService.generateToken(user, remoteAddress, userAgent, user.salt || '', isAdmin, opentactToken, user.uuid, user.active);
        user.password = undefined;
        user.salt = undefined;
        await this.userFacade.updateUserLastLoginField(user.id);
        return AuthService.response(user, company);

    }

    public async signUp(body): Promise<SignInResponse> {
        try {
            let invitation;
            if (body.invitationUuid) {
                invitation = await this.userFacade.getInvitationByUuid(body.invitationUuid);
            }
            const user = new User();
            user.email = body.email;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.password = body.password;
            user.rePassword = body.rePassword;
            user.companyName = body.companyName;
            user.userPhone = body.userPhone;
            user.planID = (body.planID) ? body.planID : null;
            if (user.planID) {
                let plan = await this.planFacade.getPlanByPlanId(user.planID);
                if (!plan) await HelperClass.throwErrorHelper('auth:planByThisIdIsNotExist');
            }
            const response = await this.userFacade.signupUser(user, invitation);
            /* Don't need email confirmation now
            **
            if (response.user) {
                response.user.password = undefined;
                response.user.salt = undefined;
            } 
            */
            return response
        } catch (err) {
            console.log(err)
            return { error: err.message }
            // throw err;
        }
    }

    async generateApiKey(currentUser, remoteAddress: string, userAgent) {
        const user: any = await this.userFacade.findById(currentUser.userId);
        if (!user) throw new Error('user:userDoNotExist');
        // const account: any = await this.userFacade.findAccountByAccountId(user.accountID);
        // if (!account.status) throw new Error('account:userIsNotApproved');
        let isAdmin = (user.isAdmin) ? user.isAdmin : false;
        let nonce = await this.opentactService.nonce();
        let adminToken = await this.opentactAuth.adminLoginGettignToken();
        let userTokenOpentact = (!isAdmin) ? await this.opentactService.getSessionTokenByUuidAndNonce(nonce.nonce, user.uuid) : null;
        let opentactToken = (isAdmin) ? adminToken.token : userTokenOpentact.sessionToken;
        let token = await AuthService.generateToken(user, remoteAddress, userAgent, user.salt || '', isAdmin, opentactToken, user.uuid, user.active);
        const token_obj: any = await JWTHelper.verify(token);
        let api_key = new ApiKey();
        api_key.createdOn = new Date(token_obj.iat * 1000);
        api_key.apiKey = token;
        api_key.expiredOn = new Date(token_obj.exp * 1000);
        api_key.user = User.withId(token_obj.userId);
        await this.userFacade.saveApiKey(api_key);
        return 'Bearer ' + token;
    }

    async getAllApiKey(currentUser) {
        return this.userFacade.getAllApiKey(currentUser.userId);
    }

}

interface SignInResponse {
    user?: User;
    // account?: Account;
    company?: any;
    error?: string;
}
