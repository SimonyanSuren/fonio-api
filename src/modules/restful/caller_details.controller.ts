'use strict';

import {Controller, Get, Post, HttpStatus, Req, Res, Param} from '@nestjs/common';
import {Response} from 'express';
import {CallerDetailsFacade} from '../facade';
import {ApiResponse, ApiOperation, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {errorResponse} from "../../filters/errorRespone";

@Controller("caller_details")
@ApiBearerAuth()
export class CallerDetailsController {
    constructor(private callerDetailsFacade: CallerDetailsFacade) {
    }

    @Get(":caller_number")
    @ApiParam({name: "caller_number", description: "caller_number", required: true, type: String})
    @ApiResponse({ status: 200, description: "caller detail info" })
    @ApiOperation({ description: "get caller detail info.", operationId: "getCallerDetails", summary: "Get Caller Detail" })
    public async getCallerDetails( @Req() req, @Res() res: Response, @Param("caller_number") caller_number: string) {
        try {
            res.status(HttpStatus.OK).json(await this.callerDetailsFacade.get(req.user, caller_number));
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post(":caller_number")
    @ApiParam({name: "caller_number", description: "caller_number", required: true, type: String})
    @ApiResponse({ status: 200, description: "caller detail info" })
    @ApiOperation({ description: "update caller detail info.", operationId: "updateCallerDetails", summary: "Update Caller Detail" })
    public async updateCallerDetails(@Req() req, @Res() res: Response, @Param("caller_number") caller_number: string) {
        try {
            res.status(HttpStatus.OK).json(await this.callerDetailsFacade.update(req.user, caller_number, req.body));
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

}
