'use strict';

import {Controller, Get, Post, Patch, HttpStatus, Req, Res, Query, Param, Body} from '@nestjs/common';
import {Response} from 'express';
import {CompanyFacade} from '../facade';
import {Company, User} from '../../models';
import {ApiBody, ApiResponse, ApiOperation, ApiBearerAuth, ApiTags, ApiQuery, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";
import {CompanyUpdate, CompanyStatus} from '../../util/swagger/company_id';
import {HelperClass} from "../../filters/Helper";
import { CompanyMember, CompanyMemberUpdate } from '../../util/swagger';
const RreateRoles: string[] = ['user', 'company'];

@Controller("company")
@ApiBearerAuth()
@ApiTags("company")
export class CompanyController {
    constructor(
        private companyFacade: CompanyFacade
    ) {
    }

    @Get('all')
    @ApiQuery({name: 'companyUuid', description: 'company uuid', required: false})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All companies", operationId: "get", summary: "All Companies"})
    public async findAll(@Req() req, @Res() res: Response, @Query("companyUuid") companyUuid: string) {
        try {
            let user = req.user;
            const companies = await this.companyFacade.getAllCompanies(companyUuid);
            res.status(HttpStatus.OK).json(companies);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('list')
    @ApiQuery({name: 'companyUuid', description: 'company uuid', required: false})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All companies from creator", operationId: "get", summary: "Companies Creator"})
    public async findByCreator(@Req() req, @Res() res: Response, @Query("companyUuid") companyUuid: string) {
        try {
            let user = req.user;
            const companies = await this.companyFacade.getAllCompaniesByUserCreator(user.userId, companyUuid);
            res.status(HttpStatus.OK).json(companies);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':uuid/members/:role')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "role", description: "member role", required: true, enum: RreateRoles })
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All members of company", operationId: "getMembers", summary: "Company Members"})
    public async findByCompany(@Req() req, @Res() res: Response, 
        @Param("uuid") uuid: string,
        @Param("role") role: string
    ) {
        try {
            if (!RreateRoles.includes(role)) await HelperClass.throwErrorHelper('role:invalidMemberRole');

            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let members: any;
            if (role === 'user') {
                members = await this.companyFacade.getUserListByCompanyUuid(uuid);
                members.forEach(function(item, i) {
                    item.password = undefined;
                    item.salt = undefined;
                })
            } else if (role === 'company') {
                members = await this.companyFacade.getCompanyListByParentCompanyUuid(uuid);
            }

            res.status(HttpStatus.OK).json(members);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':uuid/create/:role')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "role", description: "member role", required: true, enum: RreateRoles })
    @ApiBody({
        // name: "user", 
        required: true, type: CompanyMember})
    @ApiOperation({description: "Create member.", operationId: "createMember", summary: "Create member"})
    public async createSelfUser(@Req() req, @Res() res: Response, 
        @Param('uuid') uuid: string,
        @Param('role') role: string
    ) {
        try {
            if (!RreateRoles.includes(role)) await HelperClass.throwErrorHelper('role:invalidMemberRole');
            const body = req.body;
            if (role === 'company' && !body.companyName) await HelperClass.throwErrorHelper('company:companyNameRequired');
            const user = new User();
            user.email = body.email;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.password = body.password;
            user.userPhone = body.userPhone;
            user.companyName = body.companyName;
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');
            
            // user.userLastLogin = body.userLastLogin;
            await this.companyFacade.createUser(user, uuid, role);
            const us = await this.companyFacade.getUserListByCompanyUuid(uuid);
            us.forEach(function(item, i) {
                item.password = undefined;
                item.salt = undefined;
            })
            
            res.status(HttpStatus.OK).json(us);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':uuid/user/:userUuid')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "userUuid", description: "user uuid", required: true, type: String})
    @ApiBody({
        // name: "user", 
        required: true, type: CompanyMemberUpdate})
    @ApiOperation({description: "Edit user.", operationId: "editUser", summary: "Edit user"})
    public async editSelfUser(@Req() req, @Res() res: Response, 
        @Body() body: CompanyMemberUpdate,
        @Param('uuid') uuid: string,
        @Param('userUuid') userUuid: string
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');
            let user_exist = await this.companyFacade.getUserUuidByCompanyUuid(uuid, userUuid);
            if (!user_exist) await HelperClass.throwErrorHelper('company:userWithThisUuidDoesNotExist');

            const user = new User();
            user.userPhone = body.phone;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.link = body.link;

            let updatedUser = await this.companyFacade.updateCompanyUser(uuid, userUuid, user);

            if (updatedUser) {
                updatedUser.password = undefined;
                updatedUser.salt = undefined;
            }
            
            res.status(HttpStatus.OK).json(updatedUser);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':uuid')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiOperation({description: "Change company information", operationId: "changeCompany", summary: "Change company information"})
    @ApiBody({
        // name: "company", 
        required: true, type: CompanyUpdate})
    @ApiResponse({status: 200, description: "Add OK"})
    public async changeCompany(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
        try {
            let {name} = req.body;
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDonesNotExist');

            const result = await this.companyFacade.changeCompany({ companyName: name });
            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('byId/:id')
    @ApiParam({name: "id", description: "company id", required: true, type: Number})
    @ApiOperation({description: "Get company informations.", operationId: "getCompany", summary: "Get company infotmation"})
    public async getCompanies(@Req() req, @Param("id") id: number, @Res() res: Response) {
        try {
            const company = await this.companyFacade.getCompanyById(id);
            if (!company) {
                await HelperClass.throwErrorHelper('company:notFound');
            }
            return res.status(HttpStatus.OK).json(company);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch('disable/:id')
    @ApiParam({name: "id", description: "company id", required: true, type: Number})
    @ApiOperation({description: "update status", operationId: "updateStatus", summary: "Update Status"})
    @ApiBody({
        // name: "users", 
        required: true, type: CompanyStatus})
    @ApiResponse({status: 200, description: "Add OK"})
    public async updateStatus(@Req() req, @Param("id") id: number, @Res() res: Response) {
        try {
            const company = await this.companyFacade.getCompanyById(id);
            if (!company) {
                await HelperClass.throwErrorHelper('company:companyWithThisIdIsNotExist');
            }
            let result = await this.companyFacade.updateStatus(id, req.body.status);
            res.status(HttpStatus.OK).json({response: result[0]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

}
