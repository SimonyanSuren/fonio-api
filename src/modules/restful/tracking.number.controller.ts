'use strict';

import { Inject, Controller, Post, HttpStatus, Req, Res, Get, Patch, Delete, Query, Param, Body } from '@nestjs/common';
import { Response } from 'express';
import { AccountNumberFacade } from '../facade';
import { AccountNumber } from '../../models';
import { OpentactService,opentactITNSearchResponse } from "../opentact";
import {
    TrackingNumber,
    TrackingNumberPatch,
    DisableEnable,
    NumberFeatures
} from "../../util/swagger/tracking_number_post";
import { ApiResponse, ApiTags, ApiBearerAuth, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
import { errorResponse } from "../../filters/errorRespone";
import { CommonService } from '../services/common.service';
import { Repositories} from '../db/repositories';

@Controller("tracking_numbers")
@ApiTags("Tracking numbers")
export class TrackingNumberController {
    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories, 
        private accountNumberFacade: AccountNumberFacade,
        private opentactService: OpentactService,
        private commonService: CommonService
    ) {
    }

    @Post()
    @ApiBearerAuth()
    @ApiBody({
        required: true, type: TrackingNumber,
    })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: AccountNumber, isArray: false })
    public async create(@Req() req, @Res() res: Response) {
        try {
            let response = await this.accountNumberFacade.create(req.user, req.body);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch()
    @ApiBearerAuth()
    @ApiBody({
        required: true, type: TrackingNumberPatch,
    })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: AccountNumber, isArray: false })
    public async patch(@Req() req, @Res() res: Response) {
        try {
            let response = await this.accountNumberFacade.patch(req.user, req.body);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiQuery({ name: 'skip', description: 'Pagination page. default 1', required: false })
    @ApiQuery({ name: 'take', description: 'Max elements to return. default 10', required: false })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: opentactITNSearchResponse, isArray: false })
    public async get(@Req() req, @Res() res: Response,
        @Query("skip") skip: number,
        @Query("take") take: number) {
        try {
            let response = await this.opentactService.getTrackingNumbers({skip, take});
            return res.status(HttpStatus.OK).json({ response: response.success, entries: response.payload.data });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('search/by')
    @ApiQuery({ name: 'skip', description: 'Pagination page. default 1', required: false })
    @ApiQuery({ name: 'take', description: 'Max elements to return. default 10', required: false })
    @ApiQuery({ required: false, name: 'profile', description: 'Default: \"US\". TN Profile name' })
    @ApiQuery({ required: false, name: 'search', description: 'Default: \"xxxx\". 4 (for \"long_code\") or 7 (for \"toll_free\") digit numbers. To search full number provide the whole 4 or 7 numbers. In a case of seraching numbers that are starting or ending with provideed ones, fill the missing ones with \"x\". For example: xx67, 67xx or xxxx123, 123xxxxx.' })
    @ApiQuery({ name: 'city', description: 'Location Full Name filter for telephone numbers.', required: false })
    @ApiQuery({ name: 'state', description: 'Two-letter state or province abbreviation (e.g. IL, CA)', required: false })
    @ApiQuery({ name: 'type', description: 'Default: \"long_code\".The type of number. Must be "long_code" or "toll_free"', required: false })
    @ApiQuery({ name: 'npa', description: 'Default undefined. NPA ratecenter', required: false })
    @ApiQuery({ name: 'nxx', description: 'Default undefined. NPA ratecenter', required: false })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: opentactITNSearchResponse, isArray: false })
    @ApiBody({
        type: NumberFeatures,
    })
    public async getBySearch(@Req() req, 
        @Res() res: Response, 
        @Query("search") search: string = 'xxxx',
        @Query("skip") skip: number,
        @Query("take") take: number,
        @Query("profile") profile: string = 'US',
        @Query("city") city: any,
        @Query("state") state: any,
        @Query("type") type: any = 'long_code',
        @Body("features") features: string[],
        @Body("npa") npa: any,
        @Body("nxx") nxx: any,
    ) {
        try {  
            if (!['toll_free', 'long_code'].includes(type)){
                return res.status(HttpStatus.BAD_REQUEST).json({ message: "type must me one of the following ['toll_free', 'long_code']" });
            }
            let num_type: any = type === 'long_code' ? {line: search||'xxxx'} : {pattern: search||'xxxxxxx'};
            let response = await this.opentactService.getTrackingNumbers({ ...{ skip, take, type, profile, city, state, features, npa, nxx }, ...num_type });
            return res.status(HttpStatus.OK).json(response);
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiParam({ name: "id", description: "tracking number id", required: true, type: Number })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: AccountNumber, isArray: false })
    public async delete(@Req() req, @Res() res: Response, @Param("id") id) {
        try {
            let response = await this.accountNumberFacade.delete(id, req.user);
            return res.status(HttpStatus.OK).json({ response: 'ok' });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch('disable/enable')
    @ApiBearerAuth()
    @ApiBody({
        required: true, type: DisableEnable,
    })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: AccountNumber, isArray: false })
    public async disableEnable(@Req() req, @Res() res: Response) {
        try {
            let { id, status } = req.body;
            let response = await this.accountNumberFacade.disableEnable(id, req.user, status);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':id/:caflId')
    @ApiBearerAuth()
    @ApiParam({ name: "id", description: "tracking number id", required: true, type: Number })
    @ApiParam({ name: "caflId", description: "call flow id", required: true, type: Number })
    @ApiResponse({ status: 200, description: "numbers trackingNumber OK", type: AccountNumber, isArray: false })
    public async assignCallFlow(@Req() req, @Res() res: Response, @Param("id") id, @Param("caflId") caflId) {
        try {
            let response = await this.accountNumberFacade.assignCallFlow(req.user, id, caflId);
            return res.status(HttpStatus.OK).json({ response: response });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }


    @Get('provinces/list')
    @ApiQuery({ name: 'page_size', required: false })
    @ApiQuery({ name: 'page', required: false })
    public async getProvinces(@Req() req, @Res() res: Response,
        @Query('page') page: number = 1,
        @Query('page_size') pageSize: number = 10,) {
        try {
            let response = await this.commonService.getEntities(this.Repositories.PROVINCE,{ 
                page, pageSize, where:{}
            })
            res.status(HttpStatus.OK).json(response);
        } catch (err) {
            errorResponse(res, err, HttpStatus.BAD_REQUEST);
        }
    }

}
