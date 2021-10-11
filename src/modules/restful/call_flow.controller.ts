'use strict';

import { Controller, Post, Patch, Get, Delete, HttpStatus, Req, Res, Param, Query, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { MessageCodeError } from '../../util/error';
import { CallFlowFacade } from '../facade';
import {
    ApiBearerAuth, ApiTags, ApiResponse, ApiBody, ApiOperation, ApiQuery, ApiParam, ApiConsumes,
} from '@nestjs/swagger';
import { errorResponse } from "../../filters/errorRespone";
import { CallFlowPost, CallFlowStatus } from "../../util/swagger/call_flow";
import { HelperClass } from "../../filters/Helper";
import { CallFlow } from "../../models/call_flow.entity";
import { CallFlowStepFacade, AccountNumberFacade, RecordingFacade, DidFacade } from '../facade/';
import { ValidationPipe } from '../../util/validatior/';
import { CallFlowReq } from '../../util/swagger/';
import { OpentactService } from '../opentact';
import * as lodash from 'lodash';
import { diskStorage } from 'multer';
import * as moment from "moment";
import { existsSync, mkdirSync } from 'fs';
import constants from '../../constants';
import { OpentactAuth } from '../opentact';

@Controller("call")
@ApiTags("Call Flow")
@ApiBearerAuth()
export class CallFlowController {
    constructor(
        private opentactAuth: OpentactAuth,
        private opentactService: OpentactService,
        private callFlowFacade: CallFlowFacade,
        private callFlowStepFacade: CallFlowStepFacade,
        private recordingFacade: RecordingFacade,
        private accountNumberFacade: AccountNumberFacade,
        private didFacade: DidFacade,
    ) {
    }

    @Get()
    @ApiQuery({ name: "filter", description: "search by name", required: false })
    @ApiQuery({ name: 'didId', required: false })
    @ApiQuery({ name: 'orderBy', required: false })
    @ApiQuery({ name: 'orderType', required: false })
    @ApiQuery({ name: 'offset', description: 'page parameter', required: false })
    @ApiQuery({ name: 'limit', description: 'perPage parameter', required: false })
    @ApiQuery({ name: 'isAll', description: 'get all list', required: false })
    @ApiOperation({
        description: "returns call flow list account.",
        operationId: "getAllCallFlows",
        summary: "Call Flows account"
    })
    @ApiResponse({ status: 200, description: "callflow list OK", type: CallFlow, isArray: true })
    public async all(@Req() req, @Res() res: Response, @Query("filter") filter,
        @Query('orderBy') orderBy: string,
        @Query('orderType') orderType: string,
        @Query('didId') didId: number | undefined,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query("isAll") isAll: boolean) {
        let response = await this.callFlowFacade.findAllAccount(req.user.accountId, filter, orderBy, orderType, offset, limit, isAll, didId)
        res.status(HttpStatus.OK).json({ response: response[0], entries: response[1] });
    }

    @Get(":id")
    @ApiOperation({ description: "returns call flow by Id.", operationId: "callFlowById", summary: "Call Flow by Id" })
    @ApiResponse({ status: 200, description: "callflow by id", type: CallFlow, isArray: true })
    public async callFlowById(@Req() req, @Res() res: Response, @Param("id") id: number) {
        let callFlow = await this.callFlowFacade.findById(req.user.accountId, id);
        if (!callFlow) {
            throw new MessageCodeError("callFlow:NotFound");
        }
        callFlow.steps = await this.callFlowStepFacade.findSteps(callFlow.id, 0);
        res.status(HttpStatus.OK).json(callFlow);
    }

    @Delete(":id")
    @ApiOperation({
        description: "Dellete call Flow by Id.",
        operationId: "deleteCallFlow",
        summary: "Delete Call flow By Id"
    })
    @ApiResponse({ status: 200, description: "callflow by id", type: CallFlow, isArray: true })
    public async deleteCallFlow(@Req() req, @Res() res: Response, @Param("id") id: number) {
        await this.callFlowFacade.delete(req.user, id);
        res.status(HttpStatus.OK).json({ "deleted": "OK" });
    }

    @Post()
    @ApiQuery({ name: "apdi_id", description: "apdi id", required: false })
    @ApiQuery({ name: "acnu_id", description: "account number id", required: false })
    @ApiOperation({ description: "Create CallFlow to current account", operationId: "create", summary: "Create CallFlow" })
    @ApiOperation({ description: "create call Flow", operationId: "createCallFlow", summary: "Create call flow" })
    @ApiResponse({ status: 200, description: "CallFlow OK", type: CallFlow })
    @ApiResponse({ status: 400, description: "Missing info" })
    public async create(@Req() req, @Res() res: Response, @Body('', new ValidationPipe()) callFlowReq: CallFlowReq, @Query("apdi_id") apdi_id, @Query("acnu_id") acnu_id) {
        const callFlowEntity = await this.callFlowFacade.create(req.user, callFlowReq, apdi_id, acnu_id)
       
        if (callFlowReq.didNumbers) {
            const { userId, accountId } = req.user;
            for (let i = 0; i < callFlowReq.didNumbers?.length; i++) {
                const did = await this.didFacade.isDidCreatedByThisUserByNumber(userId, accountId, callFlowReq.didNumbers[i]);
                if (!did) await HelperClass.throwErrorHelper('did:thisDidDoesNotExist');
                const result = await this.didFacade.assignCallFlow(did?.id, callFlowEntity.id);
            }
        }
        res.status(HttpStatus.OK).json(callFlowEntity);
    }

    @Patch(":id")
    @ApiOperation({
        description: "Edit CallFlow to current account",
        operationId: "editCallFlow",
        summary: "Edit CallFlow"
    })
    @ApiResponse({ status: 200, description: "CallFlow OK", type: CallFlow })
    @ApiResponse({ status: 400, description: "Missing info" })
    public async edit(@Req() req, @Param("id") id: number, @Res() res: Response, @Body('', new ValidationPipe()) callFlowReq: CallFlowReq) {
        const companies = await this.callFlowFacade.edit(req.user, id, callFlowReq);
        res.status(HttpStatus.OK).json(companies);
    }

    @Patch(":id/status")
    @ApiOperation({
        description: "Edit CallFlow status",
    })
    public async changeStatus(@Req() req, @Param("id") id: number, @Res() res: Response, @Body('', new ValidationPipe()) status: CallFlowStatus) {
        const response = await this.callFlowFacade.changeStatus(req.user, id, status);
        res.status(HttpStatus.OK).json(response);
    }

    @Get("log/list")
    @ApiQuery({ name: "offset", description: "from param in pagination query. default=0", required: false })
    @ApiQuery({ name: "limit", description: "count param in pagination query, default=10", required: false })
    @ApiQuery({ name: "startDate", description: "start date param in pagination query. YYYY/MM/DD format. not timestamp, default=start day", required: false })
    @ApiQuery({ name: "endDate", description: "end date param in pagination query. YYYY/MM/DD format. not timestamp. default=end day", required: false })
    @ApiQuery({ name: "non_zero", description: "Call duration", required: false })
    @ApiQuery({ name: "direction", description: "Direction", required: false })
    @ApiQuery({ name: "number", description: "Number", required: false, type: String })
    @ApiQuery({ name: "duration_min", description: "Minimum duration", required: false })
    @ApiOperation({
        description: "returns call log list.",
        operationId: "getAllCallLogs",
        summary: "Call Logs"
    })
    @ApiResponse({ status: 200, description: "call log list OK", type: CallFlow, isArray: true })
    public async callLogs(@Req() req, @Res() res: Response,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Query("non_zero") non_zero: number,
        @Query("direction") direction: string,
        @Query("number") number,
        @Query("duration_min") duration_min: number) 
    {
        if (direction === 'inbound') direction = 'in'
        if (direction === 'outbound') direction = 'out'

        let adminToken = await this.opentactAuth.adminLoginGettignToken();
        const {token} = adminToken.payload
        const {userUuid} = req.user
        const filterParams = {
            duration_min: duration_min ,
            duration_max: non_zero ,
            direction: direction,
            to: number ,
            created_on_from: startDate, // start
            created_on_to: endDate,     //end
            account: userUuid,
        }

        let response = await this.opentactService.callLogsGetAll(token, limit, offset, filterParams);

        res.status(HttpStatus.OK).json({
            description: "call log list OK",
                success: response.success,
                total: response.payload.total,
                response:response.payload.data
        });
    }

    @Get("log/recent_list")
    @ApiQuery({ name: "offset", description: "from param in pagination query. default=0", required: false })
    @ApiQuery({ name: "limit", description: "count param in pagination query, default=10", required: false })
    @ApiQuery({ name: "startDate", description: "start date param in pagination query. YYYY/MM/DD format. not timestamp, default=start day", required: false })
    @ApiQuery({ name: "endDate", description: "end date param in pagination query. YYYY/MM/DD format. not timestamp. default=end day", required: false })
    @ApiOperation({
        description: "returns call log list.",
        operationId: "getAllCallLogs",
        summary: "Call Logs"
    })
    @ApiResponse({ status: 200, description: "call log list OK", type: CallFlow, isArray: true })
    public async callLogsRecentList(@Req() req, @Res() res: Response,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('offset') offset: number = 0,
        @Query('limit') limit: number = 10 ) {
        let { userId, accountId } = req.user;
        let adminToken = await this.opentactAuth.adminLoginGettignToken();
        if (startDate == undefined) {
            startDate = '1970-01-02T00:00:00';
        }
        if (endDate == undefined) {
            var now = new Date();
            endDate = moment(now).format('YYYY-MM-DDTHH:mm:ss');
        }
        let inbound_response = await this.opentactService.callLogsInbound(adminToken.payload.token, startDate, endDate, offset, limit)
        let outbound_response = await this.opentactService.callLogsOutbound(adminToken.payload.token, startDate, endDate, offset, limit)
        let result = new Array();
        for (let i = 0; i < inbound_response.payload.data.length; i++) {
            inbound_response.payload.data[i].type = 'inbound';
            result.push(inbound_response.payload.data[i])
        }
        for (let i = 0; i < outbound_response.payload.data.length; i++) {
            outbound_response.payload.data[i].type = 'outbound';
            result.push(outbound_response.payload.data[i])
        }
        result.sort((a, b) => (a.start_time_of_date > b.start_time_of_date) ? -1 : ((b.start_time_of_date > a.start_time_of_date) ? 1 : 0));
        if (result.length > limit)
            result = result.slice(0, limit)
        let trackingNumbers = (await this.accountNumberFacade.getTrackingNumbers(userId, accountId, undefined))[0];
        for (let i = 0; i < result.length; i++) {
            let index = await lodash.findIndex(trackingNumbers, elem => elem.number == result[i].routing_digits)
            if (~index) {
                result[i].company_name = trackingNumbers[index].companyName;
            }
        }

        res.status(HttpStatus.OK).json({ response: result, entries: result.length });
    }

    @Get("log/by_did/:did_number")
    @ApiQuery({ name: "offset", description: "from param in pagination query. default=0", required: false })
    @ApiQuery({ name: "limit", description: "count param in pagination query, default=10", required: false })
    @ApiQuery({ name: "startDate", description: "start date param in pagination query. YYYY/MM/DD format. not timestamp, default=start day", required: false })
    @ApiQuery({ name: "endDate", description: "end date param in pagination query. YYYY/MM/DD format. not timestamp. default=end day", required: false })
    @ApiParam({ name: "did_number", description: "did number", required: true, type: String })
    @ApiOperation({
        description: "returns call log list.",
        operationId: "getAllCallLogs",
        summary: "Call Logs"
    })
    @ApiResponse({ status: 200, description: "call log list OK", type: CallFlow, isArray: true })
    public async callLogsByDid(@Req() req, @Res() res: Response,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('offset') offset: number,
        @Query('limit') limit: number,
        @Param('did_number') didNumber: number) {
        let adminToken = await this.opentactAuth.adminLoginGettignToken();
        if (startDate == undefined) {
            startDate = '1970/01/02';
        }
        let inbound_response = await this.opentactService.callLogsInboundByDid(req.user, adminToken.token, startDate, endDate, offset, limit, didNumber)
        let outbound_response = await this.opentactService.callLogsOutboundByDid(req.user, adminToken.token, startDate, endDate, offset, limit, didNumber)
        let result = new Array();
        for (let i = 0; i < inbound_response[0].data.length; i++) {
            inbound_response[0].data[i].type = 'inbound';
            result.push(inbound_response[0].data[i])
        }
        for (let i = 0; i < outbound_response[0].data.length; i++) {
            outbound_response[0].data[i].type = 'outbound';
            result.push(outbound_response[0].data[i])
        }
        result.sort((a, b) => (a.start_time_of_date > b.start_time_of_date) ? -1 : ((b.start_time_of_date > a.start_time_of_date) ? 1 : 0));
        if (result.length > limit)
            result = result.slice(0, limit)
        res.status(HttpStatus.OK).json({ response: result, entries: result.length });
    }

    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file, cb) => {
                if (!existsSync(constants.PATH_TO_AUDIO_FOLDER)){
                    mkdirSync(constants.PATH_TO_AUDIO_FOLDER);
                }
                return cb(null, `${constants.PATH_TO_AUDIO_FOLDER}`);
            },
            filename: (req: any, file, cb) => {
                const timestamp = new Date().getTime();
                const type = file.originalname.split('.');
                return cb(null, `${req.user.userUuid}-${timestamp}.${type[type.length - 1]}`);
            }
        }),
        fileFilter: async (req, file: any, cb) => {
            return cb(null, RegExp('(audio/wav)|(audio/mp3)|(audio/mpeg)').test(file.mimetype) ? file : false);
        },
        limits: { fileSize: 1024*1024*10 } // 10 MB
    }))
    @ApiResponse({ status: 200, description: "Successful Audio uploading" })
    @Post('upload/recordings')
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: "file",
                    description: " MP3/WAV file",
                    format: 'binary',
                },
            },
        },
    })
    @ApiOperation({
        description: "multipart/form-data. upload MP3/WAV File for Play Recording",
        operationId: "uploadUserAudioFile",
        summary: "Upload UserAudioFile"
    })
    public async uploadRecordings(@Req() req, @Res() res: Response, @UploadedFile() file) {
        try {
            if (!req.file) return HelperClass.throwErrorHelper('upload:fileFormatWrong');
            const url = `${process.env.CURRENT_SERVER}/user/recordings/${file.filename}`;
            const record = await this.recordingFacade.addRecording(file, url, req.user);
            return res.status(200).json({ id: record.id, url: url, name: file.originalname });
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }


    @Get('menu-step-xml/:callFlowId/:cfsId')
    @ApiQuery({ name: "callFlowId", description: "id of the CallFlow", required: true })
    @ApiQuery({ name: "cfsId", description: "number of the CallFlow menu step", required: true })
    @ApiQuery({ name: "Digits", description: "The digits the caller pressed, excluding the finishOnKey digit if used", required: true })
    @ApiOperation({ description: "returns xml for step of the menu", operationId: "getMenuStepXml", summary: "Menu Step Xml" })
    public async getMenuStepXml(@Req() req, @Res() res: Response,
        @Param('callFlowId') callFlowId: number,
        @Param('cfsId') cfsId: number,
        @Query('Digits') Digits: number) {

        res.type("application/xml").send(await this.callFlowFacade.getMenuStepXml(callFlowId, cfsId, Digits));
    }
}
