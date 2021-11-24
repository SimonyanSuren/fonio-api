// 'use strict';

// import {Controller, Get, HttpStatus, Req, Res, Post, Param, Patch, Put, UseGuards, Query} from '@nestjs/common';
// import {Response} from 'express';
// import {AccountFacade, UserFacade, CompanyFacade} from '../facade';
// import {ApiOperation, ApiBearerAuth, ApiTags, ApiParam, ApiBody, ApiResponse, ApiQuery} from '@nestjs/swagger';
// import {errorResponse} from "../../filters/errorRespone";
// import {User} from '../../models/';
// import {HelperClass} from "../../filters/Helper";
// import {AccountInfo} from "../../util/swagger/account_number_tiny"
// import {CompanyInfo, CompanySelfInfo} from "../../util/swagger/company_id"
// import {SignupReq} from "../../util/swagger/signup"
// import { RoleGuard } from '../../util/guard/RoleGuard';
// import { Roles } from '../../util/decorator/roles.decorator';

// @Controller("account")
// @ApiTags("Account")
// @UseGuards(RoleGuard)
// @ApiBearerAuth()
// export class AccountController {
//     constructor(
//         private accountFacade: AccountFacade, 
//         private userFacade: UserFacade, 
//         private companyFacade: CompanyFacade
//     ) {}

//     @Get('all')
//     @Roles("admin")
//     @ApiQuery({name: 'orderBy'})
//     @ApiQuery({name: 'orderType'})
//     @ApiQuery({name: 'offset', description: 'page parameter'})
//     @ApiQuery({name: 'limit', description: 'perPage parameter'})
//     @ApiOperation({description: "Get all account.", operationId: "getAllAccount", summary: "Get all account"})
//     public async getAllAccount(@Req() req, @Res() res: Response,
//                             @Query('offset') offset: number,
//                             @Query('limit') limit: number,
//                             @Query('orderBy') orderBy: string,
//                             @Query('orderType') orderType: string) {
//         try {
//             console.log(req.user)
//             const account = await this.accountFacade.getAll(orderBy, orderType, offset, limit);
//             res.status(HttpStatus.OK).json({response: account[0], entries: account[1]});
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     @Get()
//     @ApiOperation({description: "Get current account.", operationId: "get", summary: "Get account"})
//     public async details(@Req() req, @Res() res: Response) {
//         try {
//             let user = req.user;
//             const account = await this.accountFacade.findById(user.accountId);
//             res.status(HttpStatus.OK).json(account);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     @Post('/user')
//     @ApiBody({
//         // name: "user", 
//         required: true, type: SignupReq})
//     @ApiOperation({description: "Create user.", operationId: "createUser", summary: "Create user"})
//     public async createSelfUser(@Req() req, @Res() res: Response) {
//         try {
//             const body = req.body;
//             const user = new User();
//             user.email = body.email;
//             user.firstName = body.firstName;
//             user.lastName = body.lastName;
//             user.password = body.password;
//             user.companyName = body.companyName;
//             user.type = body.type;
//             // user.userLastLogin = body.userLastLogin;
//             user.companyID = req.user.companyId;
//             await this.companyFacade.createUser(user);
//             const us = await this.userFacade.getUserListByCompId(user.companyID);
//             us.forEach(function(item, i) {
//                 item.password = undefined;
//                 item.salt = undefined;
//             })
            
//             res.status(HttpStatus.OK).json(us);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     // @Post(':uuid/user')
//     // @ApiParam({name: "uuid", description: "account uuid", required: true, type: String})
//     // @ApiBody({
//     //     // name: "user", 
//     //     required: true, type: SignupReq})
//     // @ApiOperation({description: "Create user.", operationId: "createUser", summary: "Create user"})
//     // public async createUser(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
//     //     try {
//     //         const body = req.body;
//     //         const user = new User();
//     //         user.email = body.email;
//     //         user.firstName = body.firstName;
//     //         user.lastName = body.lastName;
//     //         user.password = body.password;
//     //         user.companyName = body.companyName;
//     //         user.isAdmin = body.isAdmin;
//     //         // user.userLastLogin = body.userLastLogin;
//     //         const account = await this.accountFacade.findByUuid(uuid);
//     //         if (!account) {
//     //             await HelperClass.throwErrorHelper('account:accountWithThisUuidIsNotExist');
//     //         }
//     //         else
//     //             user.accountID = account.id;
//     //         await this.accountFacade.createUser(user);
//     //         const us = await this.userFacade.getUserListByAccId(user.accountID, undefined);
//     //         us.forEach(function(item, i) {
//     //             item.password = undefined;
//     //             item.salt = undefined;
//     //         })
            
//     //         res.status(HttpStatus.OK).json(us);
//     //     } catch (err) {
//     //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//     //     }
//     // }

//     @Put()
//     @ApiOperation({description: "Change account information", operationId: "changeAccount", summary: "Change account information"})
//     @ApiBody({
//         // name: "account", 
//         required: true, type: AccountInfo})
//     @ApiResponse({status: 200, description: "Add OK"})
//     public async updateAccount(@Req() req, @Res() res: Response) {
//         try {
//             let {userId, accountId} = req.user;
//             let {name, techPrefix, dnlId, planUuid, status, allowOutbound, metadata, number} = req.body;
//             let account = await this.accountFacade.findById(accountId);
//             if (!account) {
//                 await HelperClass.throwErrorHelper('account:accountWithThisIdIsNotExist');
//             }
//             else {
//                 if (name)
//                     account.name = name;
//                 if (number)
//                     account.number = number;
//                 if (allowOutbound != undefined)
//                     account.allowOutbound = allowOutbound;
//                 if (techPrefix)
//                     account.techPrefix = techPrefix;
//                 if (dnlId)
//                     account.dnlId = dnlId;
//                 if (planUuid)
//                     account.planUuid = planUuid;
//                 if (status != undefined)
//                     account.status = status;
//                 if (metadata)
//                     account.metadata = metadata;
//             }

//             const result = await this.accountFacade.changeAccount(account);
//             res.status(HttpStatus.OK).json(result);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }
    
//     @Patch(':uuid')
//     @ApiParam({name: "uuid", description: "account uuid", required: true, type: String})
//     @ApiOperation({description: "Change account information", operationId: "changeAccount", summary: "Change account information"})
//     @ApiBody({
//         // name: "account", 
//         required: true, type: AccountInfo})
//     @ApiResponse({status: 200, description: "Add OK"})
//     public async changeAccount(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
//         try {
//             let {name, techPrefix, dnlId, planUuid, status, allowOutbound, metadata} = req.body;
//             let account = await this.accountFacade.findByUuid(uuid);
//             if (!account) {
//                 await HelperClass.throwErrorHelper('account:accountWithThisUuidIsNotExist');
//             }
//             else {
//                 if (name)
//                     account.name = name;
//                 if (techPrefix)
//                     account.techPrefix = techPrefix;
//                 if (dnlId)
//                     account.dnlId = dnlId;
//                 if (planUuid)
//                     account.planUuid = planUuid;
//                 if (status != undefined)
//                     account.status = status;
//                 if (allowOutbound != undefined)
//                     account.allowOutbound = allowOutbound;
//                 if (metadata)
//                     account.metadata = metadata;
//             }

//             const result = await this.accountFacade.changeAccount(account);
//             res.status(HttpStatus.OK).json(result);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     @Post('/company')
//     @ApiOperation({description: "Create company.", operationId: "createCompany", summary: "Create company"})
//     @ApiBody({
//         // name: "company", 
//         required: true, type: CompanySelfInfo})
//     public async createSelfCompany(@Req() req, @Res() res: Response) {
//         try {
//             let account_id;
//             const body = req.body;
//             account_id = req.user.accountId;
//             const company = await this.accountFacade.createCompany(req.user, account_id, { ...body, ...{ userUuid: req.user.userUuid } });
//             if (req.body.uuids) {
//                 await this.companyFacade.addUsers(req.body.uuids, body.name);
//             }
//             res.status(HttpStatus.OK).json(company);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     @Post(':uuid/company')
//     @ApiParam({name: "uuid", description: "account uuid", required: true, type: String})
//     @ApiOperation({description: "Create company.", operationId: "createCompany", summary: "Create company"})
//     @ApiBody({
//         // name: "company", 
//         required: true, type: CompanyInfo})
//     public async createCompany(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
//         try {
//             let account_id;
//             const body = req.body;
//             const account = await this.accountFacade.findByUuid(uuid);
//             if (!account) {
//                 await HelperClass.throwErrorHelper('account:accountWithThisUuidIsNotExist');
//             }
//             else
//                 account_id = account.id;
//             const company = await this.accountFacade.createCompany(req.user, account_id, body);
//             res.status(HttpStatus.OK).json(company);
//         } catch (err) {
//             errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//         }
//     }

//     // @Get('/companies')
//     // @ApiOperation({description: "Get company informations.", operationId: "getCompanies", summary: "Get company infotmations"})
//     // public async getCompanies(@Req() req, @Res() res: Response) {
//     //     try {
//     //         let accountId;
//     //         accountId = req.user.accountId;
//     //         const companies = await this.companyFacade.getAllCompaniesByAccountId(accountId);
//     //         return res.status(HttpStatus.OK).json(companies);
//     //     } catch (err) {
//     //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
//     //     }
//     // }

//     @Put('/company')
//     @ApiOperation({ description: "edit company.", operationId: "editCompany", summary: "Edit Company" })
//     @ApiResponse({ status: 200, description: "company edited", type: CompanyInfo })
//     @ApiBody({
//         // name: "company", 
//         required: true, type: CompanyInfo})
//     public async editCompany( @Req() req, @Res() res: Response) {
//         const body = req.body;
//         let old_name;

//         const company = await this.companyFacade.getCompanyById(body.id);
//         if (!company) {
//             await HelperClass.throwErrorHelper('company:notFound');
//         }
//         else {
//             old_name = company.companyName;
//             company.companyName = body.name;
//             company.timezone = body.timezone;
//         }
//         await this.accountFacade.editCompany(company);
//         await this.companyFacade.unassignUsers(old_name);
//         await this.companyFacade.addUsers(req.body.uuids, body.name);
//         res.status(HttpStatus.OK).json(company);
//     }

// }
