'use strict';

import {Controller, Get, Post, Patch, HttpStatus, Req, Res, Query, Param} from '@nestjs/common';
import {Response} from 'express';
import {CompanyFacade} from '../facade';
import {Company, User} from '../../models';
import {ApiBody, ApiResponse, ApiOperation, ApiBearerAuth, ApiTags, ApiQuery, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";
import {CompanyPost, CompanyUsers, CompanyInfo, CompanyStatus} from '../../util/swagger/company_id';
import {OpentactAuth} from "../opentact";
import {HelperClass} from "../../filters/Helper";
import { SignupReq } from '../../util/swagger';

@Controller("company")
@ApiBearerAuth()
@ApiTags("company")
export class CompanyController {
    constructor(
        private opentactAuth: OpentactAuth,
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

    @Post('user')
    @ApiBody({
        // name: "user", 
        required: true, type: SignupReq})
    @ApiOperation({description: "Create user.", operationId: "createUser", summary: "Create user"})
    public async createSelfUser(@Req() req, @Res() res: Response) {
        try {
            const body = req.body;
            const user = new User();
            user.email = body.email;
            user.firstName = body.firstName;
            user.lastName = body.lastName;
            user.password = body.password;
            user.companyName = body.companyName;
            user.type = body.type;
            // user.userLastLogin = body.userLastLogin;
            await this.companyFacade.createUser(user, req.user.companyUuid);
            const us = await this.companyFacade.getUserListByCompanyUuid(user.companyUuid);
            us.forEach(function(item, i) {
                item.password = undefined;
                item.salt = undefined;
            })
            
            res.status(HttpStatus.OK).json(us);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':uuid/users')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiOperation({description: "Add user to company", operationId: "addUsers", summary: "Add user to company"})
    @ApiBody({
        // name: "users", 
        required: true, type: CompanyUsers})
    @ApiResponse({status: 200, description: "Add OK"})
    public async addUsers(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
        try {
            let company_name;
            const company = await this.companyFacade.getCompanyByUuid(uuid);
            if (!company) {
                await HelperClass.throwErrorHelper('company:companyWithThisUuidIsNotExist');
            }
            else
                company_name = company.companyName;
            await this.companyFacade.addUsers(req.body.uuids, company_name);
            res.status(HttpStatus.OK).json({response: 'ok'});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':uuid')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiOperation({description: "Change company information", operationId: "changeCompany", summary: "Change company information"})
    @ApiBody({
        // name: "company", 
        required: true, type: CompanyInfo})
    @ApiResponse({status: 200, description: "Add OK"})
    public async changeCompany(@Req() req, @Param("uuid") uuid: string, @Res() res: Response) {
        try {
            let {name} = req.body;
            let company = await this.companyFacade.getCompanyByUuid(uuid);
            if (!company) {
                await HelperClass.throwErrorHelper('company:companyWithThisUuidIsNotExist');
            }
            else
                company.companyName = name;

            const result = await this.companyFacade.changeCompany(company);
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
