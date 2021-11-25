'use strict';

import {Controller, Get, Post, Patch, HttpStatus, Req, Res, Query, Param, Body} from '@nestjs/common';
import {Response} from 'express';
import {CompanyFacade} from '../facade';
import {Company, User} from '../../models';
import {ApiBody, ApiResponse, ApiOperation, ApiBearerAuth, ApiTags, ApiQuery, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";
import {CompanyPost, CompanyUsers, CompanyUpdate, CompanyStatus} from '../../util/swagger/company_id';
import {OpentactAuth} from "../opentact";
import {HelperClass} from "../../filters/Helper";
import { CompanyMember, CompanyMemberUpdate } from '../../util/swagger';
import bodyParser = require('body-parser');

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

    @Post()
    @ApiOperation({description: "Create company", operationId: "create", summary: "Create Company"})
    @ApiBody({
        // name: "user", 
        required: true, type: CompanyPost})
    @ApiResponse({status: 200, description: "Company OK", type: Company})
    public async create(@Req() req, @Res() res: Response) {
        try {
            let {companyName, zone,userID} = req.body;
            let {userId, userUuid} = req.user;
            if (!companyName) await HelperClass.throwErrorHelper('company:youShouldPassCompanyName');
            if (!zone) await HelperClass.throwErrorHelper('company:youShouldPassTimeZone');
            let isCompanyExistWithTheSameName = await this.companyFacade.isCompanyExistByCompanyName(companyName, userId);
            if (isCompanyExistWithTheSameName) await HelperClass.throwErrorHelper('company:companyWithTheSameNameExist');
           
            // let adminToken = await this.opentactAuth.adminLoginGettignToken();
            let helper = new HelperClass();
            
            let timezones: any = await helper.callbackGetJson();
            
            let comparedZone: Array<object> = [];
            
            for (let i = 0; i < timezones.length; i++) {
                if (zone === timezones[i].zone) {
                    await comparedZone.push(timezones[i]);
                }            
            }
            
            if (comparedZone.length === 0) await HelperClass.throwErrorHelper('company:timeZoneWhichYouPassDoesNotExist');
            
            const companies = await this.companyFacade.createCompany(req.user, req.body, '778fe85b-ec0a-44f1-af5e-3be274fc7957', userUuid);
            res.status(HttpStatus.OK).json(companies);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':uuid/user')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiBody({
        // name: "user", 
        required: true, type: CompanyMember})
    @ApiOperation({description: "Create user.", operationId: "createUser", summary: "Create user"})
    public async createSelfUser(@Req() req, @Res() res: Response, @Param('uuid') uuid: string) {
        try {
            const body = req.body;
            const user = new User();
            user.email = body.email;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.password = body.password;
            user.userPhone = body.userPhone;
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');
            
            // user.userLastLogin = body.userLastLogin;
            await this.companyFacade.createUser(user, uuid);
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
            console.log('here here here here here here')
            const user = new User();
            user.userPhone = body.phone;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.link = body.link;

            let updatedUser = await this.companyFacade.updateCompanyUser(uuid, userUuid, user);
            
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
