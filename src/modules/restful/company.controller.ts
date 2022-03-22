'use strict';

import {Controller, Get, Post, Patch, HttpStatus, Req, Res, Query, Param, Body, Delete} from '@nestjs/common';
import {Response} from 'express';
import {CompanyFacade} from '../facade';
import {Company, User} from '../../models';
import {ApiBody, ApiResponse, ApiOperation, ApiBearerAuth, ApiTags, ApiQuery, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";
import { CompanyUpdate, CompanyStatus, CompanyNotice } from '../../util/swagger/company_id';
import {HelperClass} from "../../filters/Helper";
import { CompanyMember, CompanyMemberUpdate, InvitationReq } from '../../util/swagger';
import { EmailService } from '../email';
import constants from '../../constants';
import { ContactReq } from '../../util/swagger/contact_req';
import { join } from 'path';
const CreateRoles: string[] = ['user', 'company'];

@Controller("company")
@ApiBearerAuth()
@ApiTags("company")
export class CompanyController {
    constructor(
        private companyFacade: CompanyFacade,
        private emailService: EmailService,
    ) {
    }

    @Get('list')
    @ApiQuery({name: 'companyUuid', description: 'company uuid', required: false})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All companies from creator", operationId: "getByCreator", summary: "Companies Creator"})
    public async findByCreator(@Req() req, @Res() res: Response, @Query("companyUuid") companyUuid: string) {
        try {
            let user = req.user;
            const companies = await this.companyFacade.getAllCompaniesByUserCreator(user.userId, companyUuid);
            res.status(HttpStatus.OK).json(companies);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':companyUuid/contacts')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiQuery({name: 'userUuid', description: 'user uuid', required: false})
    @ApiQuery({name: 'firstName', description: 'contact firstName', required: false})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All company contacts", operationId: "getContacts", summary: "Companies Contacts"})
    public async contactsList(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Query("userUuid") userUuid: string,
        @Query("firstName") firstName: string
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let contacts = await this.companyFacade.getCompanyContacts(response.result[0].company_comp_id, undefined, {userUuid, firstName});

            contacts.forEach(contact => {
                contact.assignedTo.password = undefined;
                contact.assignedTo.salt = undefined;
            })

            res.status(HttpStatus.OK).json(contacts);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':companyUuid/contacts/:id')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiParam({name: 'id', description: 'contact id'})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get company contact by id", operationId: "getContactById", summary: "Companies Contact By Id"})
    public async companyContact(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Param("id") id: string
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let contact = (await this.companyFacade.getCompanyContacts(response.result[0].company_comp_id, id))[0];
            if (!contact) await HelperClass.throwErrorHelper('contact:contactDoesNotExist');

            contact.assignedTo.password = undefined;
            contact.assignedTo.salt = undefined;

            res.status(HttpStatus.OK).json(contact);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':companyUuid/contacts/:id')
    @ApiParam({name: 'id', description: 'contact id'})
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiBody({
        required: true, type: ContactReq
    })
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "update company contact", operationId: "updateCompanyContact", summary: "Update company contact"})
    public async contactEdit(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Param("id") id: string,
        @Body() body: ContactReq
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let contacts = await this.companyFacade.UpdateCompanyContact(req.user.userId, response.result[0].company_comp_id, id, body);

            res.status(HttpStatus.OK).json(contacts);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':companyUuid/contacts/:id')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiParam({name: 'id', description: 'contact id'})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "delete company contact by id", operationId: "deleteContactById", summary: "Delete Companies Contact By Id"})
    public async deleteCompanyContact(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Param("id") id: string
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let contact = (await this.companyFacade.deleteCompanyContacts(response.result[0].company_comp_id, id));
            if (!contact.affected) await HelperClass.throwErrorHelper('contact:contactDoesNotExist');

            res.status(HttpStatus.OK).json({ message: 'Contact was successfuly removed'});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':companyUuid/:userUuid/contacts')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiParam({name: 'userUuid', description: 'user uuid'})
    @ApiBody({
        required: true, type: ContactReq
    })
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "assign user contact", operationId: "assignUserContact", summary: "Assign user contact"})
    public async assignContact(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Param("userUuid") userUuid: string,
        @Body() body: ContactReq
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let user = await this.companyFacade.getUserUuidByCompanyUuid(companyUuid, userUuid);
            if (!user) await HelperClass.throwErrorHelper('user:companyMemberWithThisUuidDoesNotExist');
            
            let contact = await this.companyFacade.assignUserContact(user?.id, req.user.userId, response.result[0].company_comp_id, body);

            res.status(HttpStatus.OK).json(contact);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
    
    @Post(':companyUuid/:userUuid/contacts/:contactId')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiParam({name: 'userUuid', description: 'user uuid'})
    @ApiParam({name: 'contactId', description: 'contact id'})
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "reassign user contact", operationId: "reassignUserContact", summary: "Reassign user contact"})
    public async reassignContact(@Req() req, @Res() res: Response, 
        @Param("companyUuid") companyUuid: string,
        @Param("userUuid") userUuid: string,
        @Param("contactId") contactId: string
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let user = await this.companyFacade.getUserUuidByCompanyUuid(companyUuid, userUuid);
            if (!user) await HelperClass.throwErrorHelper('user:companyMemberWithThisUuidDoesNotExist');
            
            let contact = await this.companyFacade.reassignUserContact(user?.id, req.user.userId, contactId, response.result[0].company_comp_id);

            res.status(HttpStatus.OK).json(contact);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':uuid/members/:role')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "role", description: "member role", required: true, enum: CreateRoles })
    @ApiQuery({ name: 'orderBy', required: false, enum: ['created'] })
    @ApiQuery({ name: 'orderType', required: false, enum: ['asc', 'desc'] })
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get All members of company", operationId: "getMembers", summary: "Company Members"})
    public async findByCompany(@Req() req, @Res() res: Response, 
        @Param("uuid") uuid: string,
        @Param("role") role: string,
        @Query('orderBy') orderBy: string,
        @Query('orderType') orderType: string,
    ) {
        try {
            if (!CreateRoles.includes(role)) await HelperClass.throwErrorHelper('role:invalidMemberRole');

            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let members: any;
            if (role === 'user') {
                members = await this.companyFacade.getUserListByCompanyUuid(uuid, orderBy, orderType);
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

    @Get(':uuid/member/:userUuid')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "userUuid", description: "member uuid", required: true, type: String })
    @ApiResponse({status: 200, description: "companies OK", type: Company, isArray: true})
    @ApiOperation({description: "get a member of company", operationId: "getMember", summary: "Company Member"})
    public async findUserByCompany(@Req() req, @Res() res: Response, 
        @Param("uuid") uuid: string,
        @Param("userUuid") userUuid: string,
    ) {
        try {
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let member = await this.companyFacade.getUserUuidByCompanyUuid(uuid, userUuid);
            if (!member) await HelperClass.throwErrorHelper('user:userWithThisUuidDoesNotExist');

            res.status(HttpStatus.OK).json(member);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(':uuid/create/:role')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "role", description: "member role", required: true, enum: CreateRoles })
    @ApiBody({
        // name: "user", 
        required: true, type: CompanyMember})
    @ApiOperation({description: "Create member.", operationId: "createMember", summary: "Create member"})
    public async createSelfUser(@Req() req, @Res() res: Response, 
        @Param('uuid') uuid: string,
        @Param('role') role: string
    ) {
        try {
            if (!CreateRoles.includes(role)) await HelperClass.throwErrorHelper('role:invalidMemberRole');
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
            });

            if (response.result.notification) {
                await this.emailService.sendMail("auth:notification", user.email, {
                    FIRST_NAME: user.firstName,
                    LAST_NAME: user.lastName,
                    LOGO: `${process.env.BASE_URL||process.env.FONIO_URL}/public/assets/logo.png`,
                    MESSAGE: `You'r account has been added.`
                });
            }
            
            res.status(HttpStatus.OK).json(us);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':uuid/user/:userUuid')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiParam({name: "userUuid", description: "user uuid", required: true, type: String})
    @ApiBody({
        required: true, type: CompanyMemberUpdate
    })
    @ApiOperation({description: "Edit user.", operationId: "editUser", summary: "Edit user"})
    public async editSelfUser(@Req() req, @Res() res: Response, 
        @Body() body: CompanyMemberUpdate,
        @Param('uuid') uuid: string,
        @Param('userUuid') userUuid: string
    ) {
        try {
            const user = new User();

            if (body.phone) user.userPhone = body.phone;
            if (body.firstName) user.firstName = body.firstName;
            if (body.lastName) user.lastName = body.lastName;
            if (body.hasOwnProperty('active')) user.active = body.active;

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
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

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
            const company = await this.companyFacade.getCompanyById(req.user.userId, id);
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
            const company = await this.companyFacade.getCompanyById(req.user.userId, id);
            if (!company) {
                await HelperClass.throwErrorHelper('company:companyWithThisIdDoesNotExist');
            }
            let result = await this.companyFacade.updateStatus(id, req.body.status);
            res.status(HttpStatus.OK).json({response: result[0]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':uuid/notification/status')
    @ApiParam({name: "uuid", description: "company uuid", required: true, type: String})
    @ApiOperation({description: "update notification status", operationId: "updateNotificationStatus", summary: "Update Notification Status"})
    @ApiBody({
        // name: "users", 
        required: true, type: CompanyStatus
    })
    @ApiResponse({status: 200, description: "Add OK"})
    public async updateNotificationStatus(@Req() req, @Param("uuid") uuid: number, @Res() res: Response) {
        try {
            const response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            let result = await this.companyFacade.updateNotificationStatus(uuid, req.body.remove_number_notification, req.body.add_number_notification);
            res.status(HttpStatus.OK).json({response: result[0]});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('invite')
    @ApiBody({
        required: true, type: InvitationReq,
    })
    @ApiResponse({ status: 200, description: "Invitation successful" })
    public async invite(@Req() req, @Res() res: Response) {
        try {
            const body = req.body;
            const response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, body.companyUuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            const invitation = await this.companyFacade.storeInvitationData(body);
            if(!invitation) return res.status(HttpStatus.BAD_REQUEST).json({ response: 'Invitation was not created.' });

            await this.emailService.sendMail("user:invite", body.email, {
                FIRST_NAME: body.firstName,
                LAST_NAME: body.lastName,
                LINK: `${constants.FONIO_DOMAIN}/#/invitation-company-${body.type ? 'admin' : 'user'}?invitationUuid=${invitation.uuid}&&type=${invitation.type}`
            });
            return res.status(HttpStatus.OK).json({ response: 'Invitation has been sent successfully.' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(":uuid/user/image/:image")
    @ApiParam({ name: 'uuid', description: 'company uuid' })
    @ApiParam({ name: 'image', description: 'image name' })
    @ApiOperation({ description: "Get user image" })
    public async getUserImage(
        @Req() req, 
        @Res() res: Response, 
        @Param('uuid') uuid: string,
        @Param('image') image: string,
    ) {
        try {
            let userUuid = image.split('_')[0];
            let user_exist = await this.companyFacade.getUserUuidByCompanyUuid(uuid, userUuid);
            if (!user_exist) await HelperClass.throwErrorHelper('company:imageDoesNotExist');

            res.sendFile(join(process.cwd(), `${constants.PATH_TO_IMAGE_FOLDER}/${image}`), function (err) {
                if (err) {
                  return res.status(404).end();
                }
            })
        } catch (e) {
            return res.status(404).send({message: e.message});
        }
    }

    @Patch(":uuid/notice")
    @ApiParam({ name: 'uuid', description: 'company uuid', required: true, type: String })
    @ApiOperation({ description: "Update company notice" })
    @ApiBody({
        required: true, type: CompanyNotice
    })
    @ApiResponse({status: 200, description: "Company notice updated successfully"})
    public async updateNotice(@Req() req, @Res() res: Response, @Param('uuid') uuid: String) {
        try {
            const { notice } = req.body;
            let response = await this.companyFacade.getAllCompaniesByUserCreator(req.user.userId, uuid);
            if (!response.count) await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            const result = await this.companyFacade.updateNotice( uuid, req.body.notice);
            res.status(HttpStatus.OK).json(result);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':companyUuid/members/:memberUuid')
    @ApiParam({name: 'companyUuid', description: 'company uuid'})
    @ApiParam({name: 'memberUuid', description: 'member uuid'})
    @ApiResponse({ status: 200, description: "companies OK", type: String })
    @ApiOperation({description: "delete company member by uuid", operationId: "deleteCompanyMemberByUuid", summary: "Delete Company member By Uuid"})
    public async deleteCompanyMemberByUuid(@Req() req, @Res() res: Response,
        @Param("companyUuid") companyUuid: string,
        @Param("memberUuid") memberUuid: string
    ) {
        try {
            const company = await this.companyFacade.getCompanyByUuid(companyUuid);

            if (!company)
                await HelperClass.throwErrorHelper('company:companyWithThisUuidDoesNotExist');

            await this.companyFacade.updateUserPurged(companyUuid, memberUuid);

            res.status(HttpStatus.OK).json({ message: 'Member was successfuly removed'});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}
