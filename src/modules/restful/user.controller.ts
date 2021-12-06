'use strict';

import { join } from 'path';
import { Inject, Controller, Get, HttpStatus, Req, Res, Post, Patch, Param, Put, Delete, Body } from '@nestjs/common';
import { Response } from 'express';
import { UserFacade, CompanyFacade } from '../facade';
import { ApiOperation, ApiBearerAuth, ApiTags, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { errorResponse } from "../../filters/errorRespone";
import { HelperClass } from "../../filters/Helper";
import { UserPatchMethod } from "../../util/swagger/user";
import { MessageCodeError } from '../../util/error';
import { AccountNumberFacade } from '../facade';
import { EmailService } from '../email';
import { InvitationReq } from '../../util/swagger';
import { CommonService } from '../services/common.service';
import { PermissionsService } from '../services/permissions.service';
import { Repositories} from '../db/repositories';
import { OpentactService } from '../opentact';
import constants from '../../constants';
import { BuyDidNumbers, PaymentsService } from '../payments';
import { SendSmsReq } from '../../util/swagger/send_sms';
import { OpentactAuth } from '../opentact';
import { UserTypes } from '../../models/user.entity';



@Controller("user")
@ApiTags("User")
@ApiBearerAuth()
export class UserController {
    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories, 
        private paymentsService: PaymentsService,
        private userFacade: UserFacade,
        private companyFacade: CompanyFacade,
        private opentactAuth: OpentactAuth,
        private opentactService: OpentactService,
        private emailService: EmailService,
        private accountNumberFacade: AccountNumberFacade,
        private commonService: CommonService,
        private permissionsService: PermissionsService,
    ) {
    }

    // @Get('/list/byAccount')
    // @ApiOperation({ description: "Get user list of account.", summary: "Get user list of account" })
    // @ApiQuery({ name: "company", description: "company name", required: false, type: String })
    // public async getUserListByAccId(@Req() req, @Query("company") company: string, @Res() res: Response) {
    //     try {
    //         let { accountId } = req.user;
    //         let users: any = await this.userFacade.getUserListByAccId(accountId, company);
    //         return res.status(HttpStatus.OK).json({
    //             response: users
    //         });
    //     } catch (err) {
    //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    @Get('/list/byCompany/:id')
    @ApiParam({ name: "id", description: "company id", required: true, type: Number })
    @ApiOperation({ description: "Get user list of company.", summary: "Get user list of company" })
    public async getUserListByCompId(@Req() req, @Param("id") id: number, @Res() res: Response) {
        try {
            let uuid;
            const company = await this.companyFacade.getCompanyById(id);
            if (!company) {
                await HelperClass.throwErrorHelper('company:notFound');
            }
            else
                uuid = company.companyUuid;

            let users: any = await this.userFacade.getUserListByCompUuid(uuid);
            return res.status(HttpStatus.OK).json({
                response: users
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiOperation({ description: "Get current company.", summary: "Get user infotmation" })
    public async getUserInformation(@Req() req, @Res() res: Response) {
        try {
            let { userId, companyId } = req.user;
            let user: any = await this.userFacade.getUserById(userId, companyId);
            if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
            return res.status(HttpStatus.OK).json({
                response: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    twoFA: user.twoFA,
                    imgLink: user.link
                }
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put(":id")
    @ApiParam({ name: "id", description: "id for getting user info", required: true, type: Number })
    @ApiBody({
        type: UserPatchMethod, required: true,
    })
    @ApiOperation({ description: "Edit user account", summary: "Put account" })
    public async putUserInformation(@Req() req, @Res() res: Response, @Param("id") id) {
        try {
            let { email, firstName, lastName, twoFA, password, rePassword, machineDetection, forwardSoftphone, logoUuid, companyName } = req.body;
            let user: any = await this.userFacade.getUserById(id, req.user.companyId);
            if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
            let emailField = email ? email : user.email;
            let firstNameField = firstName ? firstName : user.firstName;
            let lastNameField = lastName ? lastName : user.lastName;
            let companyNameField = companyName ? companyName : user.companyName;
            let twoFaField = user.twoFA;
            if (twoFA != undefined)
                twoFaField = twoFA;
            let machineDetectionField = user.machineDetection;
            if (machineDetection != undefined)
                machineDetectionField = machineDetection;
            let forwardSoftphoneField = user.twoFA;
            if (forwardSoftphone != undefined)
                forwardSoftphoneField = forwardSoftphone;
            if (password !== rePassword) throw new MessageCodeError('rePassword:NotMatch');

            let response = await this.userFacade.updateUserFieldsEntity(id, emailField, firstNameField, lastNameField, twoFaField, password, machineDetectionField, forwardSoftphoneField, companyNameField);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch()
    @ApiBody({
        type: UserPatchMethod, required: true,
    })
    @ApiOperation({ description: "Edit user account", summary: "Patch account" })
    public async patchUserInformation(@Req() req, @Res() res: Response) {
        try {
            let { userId, companyId } = req.user;
            let { email, firstName, lastName, twoFA, password, rePassword, machineDetection, forwardSoftphone, logoUuid, companyName } = req.body;
            let user: any = await this.userFacade.getUserById(userId, companyId);
            if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
            let emailField = email ? email : user.email;
            let firstNameField = firstName ? firstName : user.firstName;
            let lastNameField = lastName ? lastName : user.lastName;
            let companyNameField = companyName ? companyName : user.companyName;
            let twoFaField = user.twoFA;
            if (twoFA != undefined)
                twoFaField = twoFA;
            let machineDetectionField = user.machineDetection;
            if (machineDetection != undefined)
                machineDetectionField = machineDetection;
            let forwardSoftphoneField = user.twoFA;
            if (forwardSoftphone != undefined)
                forwardSoftphoneField = forwardSoftphone;
            if (password !== rePassword) throw new MessageCodeError('rePassword:NotMatch');

            let response = await this.userFacade.updateUserFieldsEntity(userId, emailField, firstNameField, lastNameField, twoFaField, password, machineDetectionField, forwardSoftphoneField, companyNameField);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':uuid/companies')
    @ApiParam({ name: "uuid", description: "user uuid", required: true, type: String })
    @ApiOperation({ description: "Get company informations.", operationId: "getCompanies", summary: "Get company infotmations" })
    public async getCompanies(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
        try {
            const user = await this.userFacade.getUserByUuid(uuid);
            if (!user) {
                await HelperClass.throwErrorHelper('user:userWithThisUuidIsNotExist');
            }
            const companies = await this.companyFacade.getAllCompaniesByUserCreator(user?.id);
            return res.status(HttpStatus.OK).json(companies);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @ApiParam({ name: "id", description: "user id", required: true, type: String })
    @ApiOperation({ description: "Delete user" })
    public async deleteUser(@Req() req, @Param("id") id: number, @Res() res: Response): Promise<any> {
        let where = { id }
        await this.permissionsService.checkPermissions({ userData: req.user, entity: 'user', object: where })
        //TODO: delete sipuser
        const response = await this.commonService.deleteEntity(this.Repositories.USERS, where)
        return res.status(HttpStatus.OK).json(response);
    }


    @Post('/suspend')
    @ApiOperation({ description: "Suspend user.", operationId: "suspendUser", summary: "Suspend user" })
    public async suspendUser(@Req() req, @Res() res: Response) {
        try {
            let token = await this.opentactAuth.adminLoginGettignToken();
            let tracking_numbers = (await this.accountNumberFacade.getTrackingNumbers(req.user.userId, req.user.companyId, undefined))[0];
            for (let i = 0; i < tracking_numbers.length; i++) {
                let did = tracking_numbers[i].did;
                if (did != undefined) {
                    await this.userFacade.suspendUser(req.user, token.token, did.didOpentactIdentityID, did.id, tracking_numbers[i].id);
                }
            }
            if (tracking_numbers.length == 0)
                await this.userFacade.suspendUser(req.user, undefined, undefined, undefined, undefined);
            res.status(HttpStatus.OK).json({ response: 'ok' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('/close')
    @ApiOperation({ description: "Close user.", operationId: "closeUser", summary: "Close user" })
    public async closeUser(@Req() req, @Res() res: Response) {
        try {
            let token = await this.opentactAuth.adminLoginGettignToken();
            let tracking_numbers = (await this.accountNumberFacade.getTrackingNumbers(req.user.userId, req.user.companyId, undefined))[0];
            for (let i = 0; i < tracking_numbers.length; i++) {
                let did = tracking_numbers[i].did;
                if (did != undefined) {
                    await this.userFacade.closeUser(req.user, token.token, did.didOpentactIdentityID, did.id, tracking_numbers[i].id);
                }
            }
            if (tracking_numbers.length == 0)
                await this.userFacade.closeUser(req.user, undefined, undefined, undefined, undefined);

            res.status(HttpStatus.OK).json({ response: 'ok' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    // @Post('/account/cancel')
    // @ApiOperation({ description: "Cancel user.", operationId: "cancelUser", summary: "Cancel user" })
    // public async cancelUser(@Req() req, @Res() res: Response) {
    //     try {
    //         let result = await this.userFacade.cancelAccount(req.user.accountId);
    //         res.status(HttpStatus.OK).json({ response: result });
    //     } catch (err) {
    //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    // @ApiBody({
    //     required: true, type: InvitationReq,
    // })
    // @ApiResponse({ status: 200, description: "Invitation successful" })
    // @Post('invite')
    // public async invite(@Req() req, @Res() res: Response) {
    //     try {
    //         if (req.user.type !== UserTypes.COMPANY_ADMIN) return res.status(HttpStatus.FORBIDDEN).json({ response: 'Only company admin can send invitations' });
    //         const body = req.body;
    //         await this.emailService.sendMail("user:invite", body.email, {
    //             FIRST_NAME: body.firstName,
    //             LAST_NAME: body.lastName,
    //             LINK: `${process.env.FONIO_URL}/signup`
    //         });
    //         return res.status(HttpStatus.OK).json({ response: 'Invitation has been sent successfully.' });
    //     } catch (err) {
    //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    @Get("image")
    @ApiOperation({ description: "Get user image" })
    public async getUserImage(
        @Req() req, 
        @Res() res: Response, 
    ) {
        try {
            res.sendFile(join(process.cwd(), `${constants.PATH_TO_IMAGE_FOLDER}/${req.user.userUuid}.jpeg`), function (err) {
                if (err) {
                  return res.status(404).end();
                }
            })
        } catch (e) {
            return res.status(404).send({message: e.message});
        }
    }

    @Get("recordings/:record")
    @ApiParam({ name: "record", description: "user record name", required: true, type: String })
    public async getUserRecords(
        @Req() req, 
        @Res() res: Response, 
        @Param('record') record,
    ) {
        try {
            let mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
            res.sendFile(join(process.cwd(), `/assets/${mode}/recordings/${record}`), function (err) {
                if (err || !record.includes(req.user.userUuid)) {
                  return res.status(404).end();
                }
            })
        } catch (e) {
            return res.status(404).send({message: e.message});
        }
    }

    @Post('buy_did_number')
    @ApiOperation({ description: "Buy number", })
    @ApiResponse({ status: 200, description: "id" })
    @ApiBody({
        required: true, type: BuyDidNumbers,
    })
    public async buyDidNumber(@Req() req, @Res() res: Response, @Body() body: BuyDidNumbers) {
        try {

            const { type, amount, additionalNumbers } = body;

            let userID = req.user?.userId,
                companyID = req.user?.companyId,
                numbers = additionalNumbers,
                didNumbers,
                userNumbers,
                company,
                planID = (await this.userFacade.findById(userID))?.planID;

            if (numbers) {
                let userToken = await this.opentactAuth.getToken();
                didNumbers = await this.opentactService.buyDidNumbers(userToken.payload.token, numbers);

                if (didNumbers.error) {
                    return res.status(didNumbers.error.status).json(didNumbers);
                }
                
                if (didNumbers.payload.failed) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Buying number is failed.' })
                }
            }

            let response = await this.paymentsService.createPayment({ type, amount, companyID, planID });
            if (response.error) {
                return res.status(HttpStatus.BAD_REQUEST).send({ message: (response.error === '404') ? `Payment responde with status ${response.error}`: response.error });
            }
            
            company = await this.userFacade.getCompanyByUserId(userID);

            if (numbers) {
                userNumbers = await this.accountNumberFacade.addDidNumbers(userID, companyID, true, didNumbers.payload.request?.items||numbers, company, planID);
                if (userNumbers.error) {
                    return res.status(HttpStatus.BAD_REQUEST).json(userNumbers.error);
                }
            }

            return res.status(HttpStatus.OK).json({ ...response, ...{numbers: userNumbers}, ...{userID, companyID, planID, companyUuid: company.companyUuid} });
        } catch (err) {
            throw new Error(err.message)
        }
    }

    @Post('sms')
    @ApiOperation({ description: "Send sms", })
    @ApiResponse({ status: 200, description: "sms" })
    @ApiBody({
        required: true, type: SendSmsReq,
    })
    public async sendSms(@Req() req, @Res() res: Response, @Body() body: SendSmsReq) {
        try {
            const { from, to, message } = body;
            const { token } = (await this.opentactAuth.getToken()).payload;

            let own_number = await this.accountNumberFacade.ownNumber(req.user.userId, req.user.companyId, body.from);
            if (!own_number) return res.status(401).send('From number does not belong to you.');

            const sms = await this.opentactService.sendSms(token, from, to, message);

            return res.status(200).send({ sms });
        } catch (e) {
            console.log(e)
            return res.status(400).send({ message: e.message });
        }
    }
}
