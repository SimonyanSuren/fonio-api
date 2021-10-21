'use strict';
import { Inject,Controller, Post, HttpStatus, Req, Res, Patch, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthReq, SignupReq, ChangePassword, ResetPassword, } from '../../util/swagger';
import { Config } from '../../util/config';
import { User } from '../../models/';
import { AuthService } from '../auth/';
import { EmailService } from '../email';
import { UserFacade, AdminFacade } from '../facade';
import { ApiBody, ApiResponse, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { errorResponse } from "../../filters/errorRespone";
import { Account } from "../../models";
import { compare as comparePassword, genSaltSync, hashSync } from "bcrypt";
import { getCompaignIdFromAdminToken } from '../../filters/isUserAdminByToken';
import { HelperClass } from "../../filters/Helper";
import { Repositories } from '../db/repositories';
import { PasswordHelper } from '../../util/helper';


@Controller("auth")
@ApiTags("Auth")
export class AuthController {
    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories,
        private authService: AuthService,
        private emailService: EmailService,
        private userFacade: UserFacade,
        private adminFacade: AdminFacade
    ) {
    }

    @ApiBearerAuth()
    @Get("tokens")
    public async getTokens(@Req() req, @Res() res: Response,) {
        let where = { userID: req.user.userId }
        let response = await this.authService.getEntity(this.Repositories.TOKEN, where);
        return res.json(response);
    }

    @ApiBody({
        required: true, type: SignupReq,
    })
    @ApiResponse({ status: 200, description: "Sign up successful" })
    @Post('signup')
    public async signup(@Req() req, @Res() res: Response) {
        try {
            const userSign = await this.authService.signUp(req.body);
            if (!userSign) await HelperClass.throwErrorHelper('auth:BadRequest');

            /* Don't need email confirmation now
            **
            if (userSign.user) {
                await this.emailService.sendMail("auth:signup", userSign.user.email, {
                    FIRST_NAME: userSign.user.firstName,
                    LAST_NAME: userSign.user.lastName,
                    BUTTON: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${userSign.user.uuid}`,
                    LINK: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${userSign.user.uuid}`,
                    LOGO: `${process.env.BASE_URL||process.env.FONIO_URL}/public/assets/logo.png`
                });
            }
            */

            /* Email confirmation is not being used */
            let userAgent = req.headers['user-agent'];
            let remoteAddress = req.headers["X-Forwarded-For"]
                || req.headers["x-forwarded-for"]
                || req.client.remoteAddress;

            const user: any = await this.authService.signIn(userSign.user, remoteAddress, userAgent, true);
            if (user.user.avatar) {
                user.user.avatar = Config.string("CDN_HOST", "") + user.avatar;
            }
            res.status(HttpStatus.OK).json(user);
            /* */

            /* Don't need email confirmation now
            res.status(HttpStatus.OK).json(userSign); */
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({
        required: true, type: AuthReq,
    })
    @ApiResponse({ status: 200, description: "Login OK" })
    @Post('login')
    public async login(@Req() req, @Res() res: Response) {
        try {
            const body = req.body;
            if (!body) await HelperClass.throwErrorHelper('auth:login:missingInformation');
            if (!body.email) await HelperClass.throwErrorHelper('auth:login:missingEmail');
            if (!body.password) await HelperClass.throwErrorHelper('auth:login:missingPassword');
            let userAgent = req.headers['user-agent'];

            let remoteAddress = req.headers["X-Forwarded-For"]
                || req.headers["x-forwarded-for"]
                || req.client.remoteAddress;

            const user: any = await this.authService.signIn(body, remoteAddress, userAgent);
            if (user.user.avatar) {
                user.user.avatar = Config.string("CDN_HOST", "") + user.avatar;
            }
            res.status(HttpStatus.OK).json(user);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({ status: 200, description: "Email confirmed" })
    @ApiQuery({ required: true, name: 'uuid' })
    @Get('activate')
    public async userActivation(@Req() req, @Res() res: Response) {
        try {
            let { uuid } = req.query;
            let user: User | any = await this.adminFacade.isUserWithTheSameUserUuidExist(uuid);
            if (!user) await HelperClass.throwErrorHelper('admin:userIsNotExistByThisUuid');
            let account: Account | any = await this.adminFacade.isAccountExistByAccountID(user.accountID);
            if (!account) await HelperClass.throwErrorHelper('admin:accountIsNotExistForThisUser');
            // This change may be temporary
            await this.adminFacade.updateUserActivationStatus(account.id, user.uuid, true);

            return res.redirect(301, `http://148.251.91.143:8083/login`);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({
        required: true, type: ResetPassword,
    })
    @ApiResponse({ status: 200, description: "Reset Password OK, so the mail has not been found." })
    @Post('reset/password')
    public async resetPassword(@Req() req: Request, @Res() res: Response) {
        try {
            const { email } = req.body;
            if (!email) await HelperClass.throwErrorHelper('email:youShouldPassEmail');
            await this.userFacade.resetPassword(email);
            res.status(HttpStatus.OK).send({ response: true });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({
        required: true, type: ChangePassword,
    })
    @ApiResponse({ status: 200, description: "Password successfully changed" })
    @Patch('change/password')
    public async setPassword(@Req() req, @Res() res: Response) {
        try {
            const { password, token } = req.body;
            if (!token) await HelperClass.throwErrorHelper('auth:youShouldPassToken');
            if (!password) await HelperClass.throwErrorHelper('auth:youShouldPassPassword');
            let decodetToken: string | any = await getCompaignIdFromAdminToken(token);
            let user: object | any = await this.userFacade.findByEmail(decodetToken.email);
            if (!user) await HelperClass.throwErrorHelper('auth:thisUserDoesNotExist');
            const equals = await await comparePassword(password, user.password ? user.password : '');
            if (equals) await HelperClass.throwErrorHelper('user:youCanNotUseTheSamePasswordTryNewOne');
            await PasswordHelper.validatePassword(password);
            const account: any = await this.userFacade.findAccountByAccountId(user.accountID);
            if (!user.emailConfirmed) await HelperClass.throwErrorHelper('user:disabled');
            if (!account.status) await HelperClass.throwErrorHelper('account:disabled');
            const salt = genSaltSync(Config.number("BCRYPT_SALT_ROUNDS", 10));
            let hash = hashSync(password, salt);
            await this.userFacade.updatePassword(hash, user.uuid);
            let userAgent = req.headers['user-agent'];
            let remoteAddress = req.headers["X-Forwarded-For"]
                || req.headers["x-forwarded-for"]
                || req.client.remoteAddress;
            let isAdmin = (user.isAdmin) ? user.isAdmin : false;
            let userToken = await AuthService.generateToken(user, remoteAddress, userAgent, user.salt || '', isAdmin, account, undefined, user.uuid, user.active);
            user.password = undefined;
            user.salt = undefined;
            user.token = userToken;
            let company = await this.userFacade.getAllCompaniesByUserIdAndAccountId(user.id, account.id);
            return res.status(200).json({
                response: {
                    user: user,
                    account: account,
                    company: company
                }
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({ status: 200, description: "API Key generated" })
    @Get('api_key/generate')
    public async generateApiKey(@Req() req, @Res() res: Response) {
        try {
            let userAgent = req.headers['user-agent'];

            let remoteAddress = req.headers["X-Forwarded-For"]
                || req.headers["x-forwarded-for"]
                || req.client.remoteAddress;

            const api_key: any = await this.authService.generateApiKey(req.user, remoteAddress, userAgent);
            return res.status(HttpStatus.OK).json({ api_key: api_key });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({ status: 200, description: "API Key List" })
    @Get('api_key/list')
    public async getAllApiKey(@Req() req, @Res() res: Response) {
        try {
            const api_keys: any = await this.authService.getAllApiKey(req.user);
            return res.status(HttpStatus.OK).json({ api_keys: api_keys });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}
