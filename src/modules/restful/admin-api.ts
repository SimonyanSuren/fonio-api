'use strict';

import {Controller, Get, HttpStatus, Req, Res, Post, Query, Patch, Delete, Param, UseGuards, Body} from '@nestjs/common';

import {
    ApiBearerAuth,
    ApiTags,
    ApiResponse,
    ApiBody,
    ApiQuery,
    ApiParam,
    ApiOperation
} from '@nestjs/swagger';
import {getCompaignIdFromAdminToken} from '../../filters/isUserAdminByToken';
import {errorResponse} from '../../filters/errorRespone';
import {HelperClass} from '../../filters/Helper';
import {Response} from "express";
import {AdminFacade} from "../facade/admin.facade";
import {PlanFacade, DidFacade, UserFacade, InvoiceFacade, PaymentFacade} from "../facade";
import {User} from '../../models/';
import {AdminUserActivation, ActivationResend, PaymentSettingsRequest} from "../../util/swagger/admin_restful_api";
import {UserStatus, UserPatchByAdmin} from "../../util/swagger";
import {DeleteUserByAdmin} from "../../util/swagger/plan_features";
import {OpentactService} from "../opentact";
import {EmailService} from "../email";
import { RoleGuard } from '../../util/guard/RoleGuard';
import { Roles } from '../../util/decorator/roles.decorator';
import { DisableEnableDid } from '../../util/swagger/did.dto';
import { OpentactAuth } from '../opentact';

const enum_order_by = ['createdOn', 'number', 'totalMinute', 'lastCall'];
const enum_order_type = ['asc', 'desc'];
const enum_filter_by = ['payOn', 'amount', 'userEmail', 'transactionId', 'payWith'];

@Controller("admin")
@ApiTags("Admin")
@UseGuards(RoleGuard)
@ApiBearerAuth()
export class AdminApi {
    constructor(
        private adminFacade: AdminFacade,
        private opentactAuth: OpentactAuth,
        private opentactService: OpentactService,
        private planFacade: PlanFacade,
        private emailService: EmailService,
        private userFacade: UserFacade,
        private invoiceFacade: InvoiceFacade,
        private paymentFacade: PaymentFacade,
        private didFacade: DidFacade
    ) { }

    @ApiQuery({name: 'search', description: 'Search registration by email address. It will search for any string matches.', required: false})
    @ApiQuery({name: 'orderBy', required: false})
    @ApiQuery({name: 'orderType', required: false})
    @ApiQuery({name: 'offset', description: 'offset parameter'})
    @ApiQuery({name: 'limit', description: 'limit parameter'})
    @ApiResponse({status: 200, description: "Successful getting registration list for admin"})
    @Roles("admin")
    @Get('registrations/list')
    public async getAdmin(@Req() req, @Res() res: Response,
                          @Query('search') search: string,
                          @Query('offset') offset: number = 1,
                          @Query('limit') limit: number = 10,
                          @Query('orderBy') orderBy: OrderBy = OrderBy.id,
                          @Query('orderType') orderType: OrderType = OrderType.DESC
    ) {
        try {
            let token: any = await getCompaignIdFromAdminToken(req.headers['authorization']);
            await HelperClass.isUserAdmin(token);
            let users = await this.adminFacade.getAllUsersList(orderBy, orderType, offset, limit, search);
            res.status(HttpStatus.OK).json({response: users[0], entries: users[1]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({required: true, type: AdminUserActivation, 
    })
    @ApiResponse({status: 200, description: "Successful user activating "})
    @Roles("admin")
    @Post('activate/deactivate/user')
    public async activateAgentByUserID(@Req() req, @Res() res: Response) {
        try {
            let token: any = await getCompaignIdFromAdminToken(req.headers['authorization']);
            await HelperClass.isUserAdmin(token);
            if (!req.body.userUuid) await HelperClass.throwErrorHelper('admin:youShouldPassUserUuidField');
            if (typeof(req.body.status) !== 'boolean') await HelperClass.throwErrorHelper('admin:youShouldPassStatus');
            let user: User | any = await this.adminFacade.isUserWithTheSameUserUuidExist(req.body.userUuid);
            if (!user) await HelperClass.throwErrorHelper('admin:userIsNotExistByThisUuid');
            // let account: Account | any = await this.adminFacade.isAccountExistByAccountID(user.accountID);
            // if (!account) await HelperClass.throwErrorHelper('admin:accountIsNotExistForThisUser');
            await this.adminFacade.updateUserActivationStatus(user.uuid, req.body.status);
            return res.status(HttpStatus.OK).json({response: true});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({required: true, type: ActivationResend, 
        // name: "body"
    })
    @ApiResponse({status: 200, description: "Successful activation message resend"})
    @Roles("admin")
    @Post('registration/resend')
    public async resendActivationEmail(@Req() req, @Res() res: Response) {
        try {
            let token: any = await getCompaignIdFromAdminToken(req.headers['authorization']);
            await HelperClass.isUserAdmin(token);
            if (!req.body.userUuid) await HelperClass.throwErrorHelper('admin:youShouldPassUserUuidField');
            let user: any = await this.userFacade.getUserByUuid(req.body.userUuid);
            if (!user) await HelperClass.throwErrorHelper('admin:userWithThisUuidDoesNotExist');
            await this.emailService.sendMail("auth:signup", user.email, {
                FIRST_NAME: user.firstName,
                LAST_NAME: user.lastName,
                BUTTON: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${user.uuid}`,
                LINK: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${user.uuid}`,
                LOGO: `${process.env.BASE_URL||process.env.FONIO_URL}/public/assets/logo.png`
            });
            return res.status(HttpStatus.OK).json({response: true});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiResponse({status: 200, description: "Successful getting did management statistics"})
    @ApiQuery({name: 'orderBy', enum: enum_order_by, required: false })
    @ApiQuery({name: 'orderType', enum: enum_order_type, required: false })
    @ApiQuery({name: 'offset', description: 'page parameter. 0 by default', required: false })
    @ApiQuery({name: 'limit', description: 'perPage parameter. 10 by default', required: false })
    @ApiQuery({name: 'filter', description: 'number to filter with', required: false})
    @Roles("admin")
    @Get('did')
    public async didManagmentAdmin(@Req() req, @Res() res: Response,
                                    @Query('offset') page: number = 0,
                                    @Query('limit') perPage: number = 10,
                                    @Query('orderBy') orderBy: string = OrderBy.id,
                                    @Query('orderType') orderType: string = OrderType.DESC,
                                    @Query('filter') filter: number) {
        try {
            let token: any = await getCompaignIdFromAdminToken(req.headers['authorization']);
            await HelperClass.isUserAdmin(token);
            let by = orderBy;
            let type = orderType;
            if (orderBy === 'lastCall' || orderBy === 'totalMinute') {
                by = OrderBy.id;
                type = OrderType.DESC;
            }
            let dids = await this.didFacade.getDidManagmentStatistics(by, type, page, perPage, filter);
            let adminToken = await this.opentactAuth.adminLoginGettignToken();
            let result = new Array();

            let lastCalls: any = [];
            let self = this;

            const fetchLastCall = function (startDate, number) {
                return new Promise(async (resolve, reject) => {
                    lastCalls.push((await self.opentactService.callLogsInByDid(adminToken.payload.token, startDate, undefined, 0, 1, number)).payload);
                    resolve({});
                });
            };

            let func_array: any = [];
            for (let i = 0; i < dids[0].length; i ++) {
                func_array.push(fetchLastCall(dids[0][i].createdOn, dids[0][i].number));
            }

            await Promise.all(func_array);

            for (let i = 0; i < dids[0].length; i ++) {
                let obj =  {...{
                    lastCall: (lastCalls[i] && lastCalls[i].data.length) ? lastCalls[i].data[0].created_on : null,
                    totalMinute: (lastCalls[i] && lastCalls[i].data.length) ? lastCalls[i].data[0].duration : null
                }, ...dids[0][i]};
                result.push(obj);
            }

            if (orderBy === 'totalMinute') {
                result.sort((a, b) => orderType === 'asc' ? a.totalMinute - b.totalMinute : b.totalMinute - a.totalMinute);
            }

            if (orderBy === 'lastCall') {
                result.sort((a, b) => orderType === 'asc' ? a.lastCall - b.lastCall : b.lastCall - a.lastCall);
            }

            return res.status(HttpStatus.OK).json({response: result, entries: dids[1]});

        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiBody({required: true, type: DeleteUserByAdmin})
    @ApiResponse({status: 200, description: "Successful user deleting"})
    @Roles("admin")
    @Delete('user')
    public async deleteUserByAdmin(@Req() req, @Res() res: Response) {
        try {
            let {userUuid} = req.body;
            let user = await this.userFacade.getUserByUuid(userUuid);
            if (!user) await HelperClass.throwErrorHelper('admin:userByThisUuidDoesNotExist');
            let token: any = await getCompaignIdFromAdminToken(req.headers['authorization']);
            await HelperClass.isUserAdmin(token);
            if (!userUuid) await HelperClass.throwErrorHelper('admin:youShouldPassUserUuid');
            let entity = await this.userFacade.deleteUserByUserUuid(userUuid);
            return res.status(HttpStatus.OK).json({response: entity});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/user/list/last_registered')
    @ApiOperation({description: "Get user list registered for last 30 days", summary: "user list registered for last 30 days"})
    public async getUsersLastRegistered(@Req() req, @Res() res: Response) {
        try {
            let users: any = await this.adminFacade.getUsersLastRegistered();
            return res.status(HttpStatus.OK).json({
                response: users
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('plan/:planID/user')
    @ApiParam({name: "planID", description: "Plan id", required: true, type: String})
    @ApiQuery({name: "email", description: "User email to filter with", required: false, type: String})
    @ApiQuery({name: "order_by", description: "Order by", required: false, enum: ['created_at']})
    @ApiQuery({name: "order_type", description: "Order type", required: false, enum: ['ASC', 'DESC']})
    @ApiOperation({description: "Get user list by Plan id", summary: "user list by plan id"})
    public async getUsersByPlan(@Req() req, @Res() res: Response, 
        @Param('planID') planID: String,
        @Query('email') email: String,
        @Query('order_by') order_by: String,
        @Query('order_type') order_type: String,
        
    ) {
        try {
            let users: any = await this.adminFacade.getUsersByPlan(planID, email, order_by, order_type);
            return res.status(HttpStatus.OK).json({
                response: users
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/user_daily_statistics/last_registered')
    @ApiOperation({description: "Get user daily statistics registered for last 30 days", summary: "user daily statistics registered for last 30 days"})
    public async getUsersDailyStatLastRegistered(@Req() req, @Res() res: Response) {
        try {
            let users: any = await this.adminFacade.getUsersDailyStatLastRegistered();
            return res.status(HttpStatus.OK).json({
                response: users
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/did/list/last_registered')
    @ApiOperation({description: "Get all did list registered for last 30 days", summary: "did list registered for last 30 days"})
    public async getAllDidList(@Req() req, @Res() res: Response) {
        try {
            let dids: any = await this.adminFacade.getDidLastRegistered();
            return res.status(HttpStatus.OK).json({
                response: dids
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/incoming/calls')
    @ApiOperation({description: "Get incoming calls", summary: "incoming calls"})
    @ApiQuery({ name: "startDate", description: "start date param in pagination query. YYYY-MM-DDTHH:mm:ss format.", required: false })
    @ApiQuery({ name: "endDate", description: "end date param in pagination query. YYYY-MM-DDTHH:mm:ss format.", required: false })
    @ApiQuery({ name: "offset", description: "page parameter. 0 by default", required: false })
    @ApiQuery({ name: "limit", description: "perPage parameter. 10 by default", required: false })
    public async getIncomingCalls(@Req() req, @Res() res: Response,
                            @Query("startDate") startDate: string,
                            @Query("endDate") endDate: string,
                            @Query("offset") offset: number = 0,
                            @Query("limit") limit: number = 10) {
        try {
            let adminToken = await this.opentactAuth.adminLoginGettignToken();
            let calls: any = await this.opentactService.callLogsInbound(adminToken.payload.token, startDate, endDate, offset, limit);
            return res.status(HttpStatus.OK).json({
                response: calls
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/outcoming/calls')
    @ApiOperation({description: "Get outcoming calls", summary: "outcoming calls"})
    @ApiQuery({ name: "startDate", description: "start date param in pagination query. YYYY-MM-DDTHH:mm:ss format.", required: false })
    @ApiQuery({ name: "endDate", description: "end date param in pagination query. YYYY-MM-DDTHH:mm:ss format.", required: false })
    @ApiQuery({ name: "offset", description: "page parameter. 0 by default", required: false })
    @ApiQuery({ name: "limit", description: "perPage parameter. 10 by default", required: false })
    public async getOutcomingCalls(@Req() req, @Res() res: Response,
                            @Query("startDate") startDate: string,
                            @Query("endDate") endDate: string,
                            @Query("offset") offset: number = 0,
                            @Query("limit") limit: number = 10) {
        try {
            let adminToken = await this.opentactAuth.adminLoginGettignToken();
            let calls: any = await this.opentactService.callLogsOutbound(adminToken.payload.token, startDate, endDate, offset, limit);
            return res.status(HttpStatus.OK).json({
                response: calls
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Patch('/send/reset_password_email/:email')
    @ApiParam({name: "email", description: "user email", required: true, type: String})
    @ApiOperation({description: "Send email to reset password", summary: "Send Email To Reset Password"})
    public async sendResetPassEmail(@Req() req, @Param("email") email: string, @Res() res: Response) {
        try {
            await this.userFacade.resetPassword(email);
            return res.status(HttpStatus.OK).json({ response: 'ok' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Post('user/:id/activate')
    @ApiParam({name: "id", description: "user id", required: true, type: String})
    @ApiOperation({description: "activeate user", operationId: "activateUser", summary: "Activate User"})
    @ApiResponse({status: 202, description: "Activated"})
    public async activateUser(@Req() req, @Param("id") id: string, @Res() res: Response) {
        try {
            let user = await this.userFacade.updateUserActive(true, id);
            res.status(HttpStatus.OK).json({response: user});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Post('user/:id/deactivate')
    @ApiParam({name: "id", description: "user id", required: true, type: String})
    @ApiOperation({description: "deactivate user", operationId: "deactivateUser", summary: "Deactivate User"})
    @ApiResponse({status: 202, description: "Deactivated"})
    public async deactivateUser(@Req() req, @Param("id") id: string, @Res() res: Response) {
        try {
            let user = await this.userFacade.updateUserActive(false, id);
            res.status(HttpStatus.OK).json({response: user});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Patch('update/email_confirmed/:id/:company_id')
    @ApiParam({name: "id", description: "user id", required: true, type: Number})
    @ApiParam({name: "company_id", description: "user company_id", required: true, type: Number})
    @ApiOperation({description: "update status", operationId: "updateStatus", summary: "Update Status"})
    @ApiBody({
        // name: "users", 
        required: true, type: UserStatus})
    @ApiResponse({status: 200, description: "Add OK"})
    public async updateStatus(@Req() req, @Param("id") id: number, @Param("company_id") company_id: number, @Res() res: Response) {
        try {
            const user = await this.userFacade.getUserById(id, company_id);
            if (!user) {
                await HelperClass.throwErrorHelper('user:userWithThisIdIsNotExist');
            }
            let result = await this.userFacade.updateStatus(id, req.body.status);
            res.status(HttpStatus.OK).json({response: result[0]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('user/:id/:company_id')
    @ApiParam({name: "id", description: "user id", required: true, type: Number})
    @ApiParam({name: "company_id", description: "user company_id", required: true, type: Number})
    @ApiOperation({description: "get user", operationId: "getUser", summary: "Get User"})
    @ApiResponse({status: 200, description: "Add OK"})
    public async getUser(@Req() req, @Param("id") id: number, @Param("company_id") company_id: number, @Res() res: Response) {
        try {
            const user = await this.userFacade.getUserById(id, company_id);
            if (!user) {
                await HelperClass.throwErrorHelper('user:userWithThisIdIsNotExist');
            }
            res.status(HttpStatus.OK).json({response: user});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Patch('user/:id/:company_id')
    @ApiParam({name: "id", description: "user id", required: true, type: Number})
    @ApiParam({name: "company_id", description: "user company_id", required: true, type: Number})
    @ApiOperation({description: "update user", operationId: "updateUser", summary: "Update User"})
    @ApiBody({
        required: true, type: UserPatchByAdmin})
    @ApiResponse({status: 200, description: "Add OK"})
    public async updateUser(@Req() req, @Param("id") id: number, @Param("company_id") company_id: number, @Res() res: Response) {
        try {
            const user = await this.userFacade.getUserById(id, company_id);
            if (!user) {
                await HelperClass.throwErrorHelper('user:userWithThisIdIsNotExist');
            }
            let result = await this.userFacade.updateUserByAdmin(id, req.body.status, req.body.company);
            res.status(HttpStatus.OK).json({response: result.raw});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    // @Roles("admin")
    // @Post('account/:acco_id/cancel')
    // @ApiParam({name: "acco_id", description: "account id", required: true, type: Number})
    // @ApiOperation({description: "cancel account", operationId: "cancelAccount", summary: "Cancel Account"})
    // @ApiResponse({status: 202, description: "Add Accepted"})
    // public async cancelAccount(@Req() req, @Param("acco_id") acco_id: string, @Res() res: Response) {
    //     try {
    //         let result = await this.userFacade.cancelAccount(acco_id);
    //         if (result.error) {
    //             return res.status(HttpStatus.BAD_REQUEST).json({error: result.error});
    //         }
    //         return res.status(HttpStatus.OK).json({response: result});
    //     } catch (err) {
    //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    //     }
    // }

    @Roles("admin")
    @Get('invoice/list')
    @ApiQuery({name: 'orderBy'})
    @ApiQuery({name: 'orderType'})
    @ApiQuery({name: 'offset', description: 'page parameter'})
    @ApiQuery({name: 'limit', description: 'perPage parameter'})
    @ApiParam({name: "email", description: "filter" })
    @ApiOperation({description: "getter to invoice list for admin", operationId: "invoiceList", summary: "Admin Invoice List"})
    @ApiResponse({status: 200, description: "OK"})
    public async invoiceList(@Req() req, @Res() res: Response,
                            @Query('offset') offset: number = 0,
                            @Query('limit') limit: number=10,
                            @Query('email') email?: string,
                            @Query('orderBy') orderBy?: string,
                            @Query('orderType') orderType?: string
    ) {
        try {
            let result = await this.invoiceFacade.getList(orderBy, orderType, offset, limit, email);
            res.status(HttpStatus.OK).json({list: result[0], total:result[1]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('payment/list')
    @ApiQuery({name: 'offset', description: 'page parameter. 0 by default', required: false })
    @ApiQuery({name: 'limit', description: 'perPage parameter. 10 by default', required: false })
    @ApiQuery({name: "filterBy", description: "filter field", enum: enum_filter_by, required: false })
    @ApiQuery({name: "filterValue", description: "filter value", required: false })
    @ApiQuery({name: "orderBy", description: "order by: 'ID' by default", enum: enum_filter_by, required: false })
    @ApiQuery({name: "orderType", description: "order type: 'DESC' by default", enum: enum_order_type, required: false })
    @ApiOperation({description: "getter to payment list for admin", operationId: "paymentList", summary: "Admin Payment List"})
    @ApiResponse({status: 200, description: "OK"})
    public async paymentList(@Req() req, @Res() res: Response,
                             @Query('offset') offset: number = 0,
                             @Query('limit') limit: number = 10,
                             @Query('filterBy') filterBy?: string,
                             @Query('filterValue') filterValue?: string,
                             @Query('orderBy') orderBy: string = OrderBy.id,
                             @Query('orderType') orderType: string = OrderType.DESC,
    ) {
        try {
            let result = await this.paymentFacade.getListAll(offset, limit, orderBy, orderType, filterBy, filterValue);
            res.status(HttpStatus.OK).json({list: result[0], total:result[1]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Get('/config/payment')
    @ApiOperation({description: "Get payment settings", summary: "payment settings"})
    public async getConfigPayment(@Req() req, @Res() res: Response) {
        try {
            let payment_setting: any = await this.adminFacade.getConfigPayment();
            return res.status(HttpStatus.OK).json({
                response: payment_setting.length == 0? {}: payment_setting[0]
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Patch('/config/payment')
    @ApiOperation({description: "Update payment settings", summary: "payment settings"})
    @ApiBody({
        required: true,
        type: PaymentSettingsRequest
    })
    public async updateConfigPayment(@Req() req, @Res() res: Response, @Body() body: PaymentSettingsRequest) {
        try {
            let payment_setting: any = await this.adminFacade.updateConfigPayment(body);
            return res.status(HttpStatus.OK).json({
                response: payment_setting
            });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Roles("admin")
    @Patch('did/disable/enable')
    @ApiBody({
        required: true, type: DisableEnableDid,
    })
    @ApiResponse({ status: 200, description: "Make did disable or enable" })
    public async disableOrEnableDid(@Req() req, @Res() res: Response) {
        try {
            let { id, enable } = req.body;
            let response = await this.didFacade.disableEnableDid(id, enable);
            return res.status(HttpStatus.OK).json({ response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

}

export enum OrderBy {
    id = 'id',
    companyName = 'companyName',
    email = 'email',
    creation = 'creation',
    userLastLogin = 'userLastLogin',
    // accountID = 'accountID'
}

export enum OrderType {
    ASC = 'ascending',
    DESC = 'descending'
}
