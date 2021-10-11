'use strict';

import {Controller, Get, Post, HttpStatus, Req, Res, Delete, Patch, Param} from '@nestjs/common';
import {Response} from 'express';
import {BlackListFacade, CompanyFacade} from '../facade';
import {AccountBlacklist} from '../../models';
import {AccountBlacklistSwagger, AccountBlacklistStatus} from '../../util/swagger/acoountBlacklist';
import {ApiResponse, ApiBearerAuth, ApiBody, ApiTags, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";
import {HelperClass} from "../../filters/Helper";

@Controller('blacklists')
@ApiTags("BL")
@ApiBearerAuth()
export class BlackListController {
    constructor(private blackListFacade: BlackListFacade, private companyFacade: CompanyFacade) {
    }

    @Delete(':uuid/:companyUuid')
    @ApiParam({name: "uuid", description: "uuid", required: true, type: String})
    @ApiParam({name: "companyUuid", description: "companyUuid", required: true, type: String})
    @ApiResponse({status: 200, description: "black list removed"})
    public async deleteEntity(@Req() req, @Res() res: Response, @Param("uuid") uuid: string, @Param("companyUuid") companyUuid: string) {
        try {
            if (!uuid) await HelperClass.throwErrorHelper('blacklist:youShouldPassUuidField');
            if (!companyUuid) await HelperClass.throwErrorHelper('blacklist:youShouldPassCompanyUuidField');
            let bl = await this.blackListFacade.isBlackListExist(req.user.accountId, uuid, companyUuid);
            if (!bl) await HelperClass.throwErrorHelper('blacklist:thisBlDoesNotExist');
            let response = await this.blackListFacade.deletePhone(req.user.accountId, uuid, companyUuid);
            return res.status(HttpStatus.OK).json({response: response});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiResponse({status: 200, description: "black list OK", type: AccountBlacklist, isArray: true})
    public async all(@Req() req, @Res() res: Response) {
        try {
            let {accountId} = req.user;
            let response = await this.blackListFacade.getAllBlackListsByAccountId(accountId);
            res.status(HttpStatus.OK).json(response);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post()
    @ApiBody({required: true, type: AccountBlacklistSwagger, 
    })
    @ApiResponse({status: 200, description: "black list OK", type: AccountBlacklist})
    public async create(@Req() req, @Res() res: Response) {
        try {
            if (req.user.role !== 'admin' && req.user.userType !== 'company_admin') {
                return res.status(HttpStatus.FORBIDDEN).json({ message: 'you have no permission to perform this action' })
            }
            let response = await this.blackListFacade.create(req.user, req.body);
            return res.status(HttpStatus.OK).json({response: response});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch('/:id/status')
    @ApiParam({name: "id", description: "black list id", required: true, type: Number})
    @ApiBody({required: true, type: AccountBlacklistStatus, 
    })
    @ApiResponse({status: 200, description: "black list OK", type: AccountBlacklist})
    public async edit(@Req() req, @Param("id") id: number, @Res() res: Response) {
        try {
            let response = await this.blackListFacade.changeStatus(req.body.status, id);
            return res.status(HttpStatus.OK).json({response: response});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}
