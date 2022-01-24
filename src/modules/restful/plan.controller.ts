'use strict';

import { Inject, Controller, HttpStatus, Req, Res, Patch, Get, UseGuards, Param, Body, Query, Post, Delete } from '@nestjs/common';
import { Response } from 'express';
import { PlanFacade } from '../facade';
import { Plan } from '../../models';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { errorResponse } from "../../filters/errorRespone";
import { PlanPost, UpdatePlanStatus } from "../../util/swagger/plan_features";
import { RoleGuard } from '../../util/guard/RoleGuard';
import { Roles } from '../../util/decorator/roles.decorator';
import { HelperClass } from "../../filters/Helper";
import { IPlanCreateProps, PlanNumberTypes } from '../../models/plan.constant.entity';
import { CommonService } from '../services/common.service';
import { Repositories} from '../db/repositories';

@Controller("plan")
@ApiTags("Plan")
@UseGuards(RoleGuard)
export class PlanController {
    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories, 
        private planFacade: PlanFacade,
        private commonService: CommonService) {
    }

    @Get('list')
    @ApiQuery({ name: 'orderBy', required: false, enum: ['created', 'order'] })
    @ApiQuery({ name: 'orderType', required: false, enum: ['ascending', 'descending'] })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'offset', required: false })
    @ApiOperation({ description: "returns all plans with features.", operationId: "getAllPlans", summary: "All plans" })
    public async all(@Req() req, @Res() res: Response,
        @Query('offset') offset: number = 0,
        @Query('limit') limit: number = 10,
        @Query('orderBy') orderBy: string,
        @Query('orderType') orderType: string) {
        try {
            let response = await this.planFacade.getAllPlans(orderBy, orderType, offset, limit);
            res.status(HttpStatus.OK).json(response);
        } catch (err) {
            errorResponse(res, err, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('list/:planId')
    @ApiResponse({status: 200, description: "Successful plan getting"})
    @ApiParam({name: "planId", description: "planId for getting plan info", required: true, type: String})
    @ApiOperation({ description: "Returns plans by id.", operationId: "getPlanById", summary: "Plan by id" })
    public async getPlanById(@Req() req, @Param("planId") planId, @Res() res: Response) {
        try {
            let plan = await this.planFacade.getPlanByPlanId(planId);
            if (!plan) await HelperClass.throwErrorHelper('plan:thisPlanIsNotExist');
            let did_count = await this.planFacade.getNumbersCountByPlanId(planId);
            return res.status(HttpStatus.OK).json({response: {...plan, did_count}});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get('type/:type')
    @ApiResponse({status: 200, description: "Successful plan getting"})
    @ApiParam({name: "type", description: "type for getting plan info", required: true, type: String, enum: PlanNumberTypes})
    @ApiOperation({ description: "Returns plans by type.", operationId: "getPlanByType", summary: "Plan by type" })
    public async getPlanByType(@Req() req, @Param("type") type, @Res() res: Response) {
        try {
            let plan = await this.planFacade.getPlanByPlanType(type);
            if (!plan) await HelperClass.throwErrorHelper('plan:thisPlanIsNotExist');
            let did_count = await this.planFacade.getNumbersCountByPlanId(plan?.id);
            return res.status(HttpStatus.OK).json({response: {...plan, did_count}});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Post()
    @ApiBearerAuth()
    @Roles("admin")
    @ApiBody({required: true, type: PlanPost, 
        // name: "body"
    })
    @ApiResponse({status: 200, description: "Successful plan creating"})
    @ApiOperation({ description: "create plan.", operationId: "createPlan", summary: "Create plan" })
    public async postPlanByAdmin(@Req() req, @Res() res: Response, @Body() body) {
        try {
            let object = await this.planFacade.getPlanObjectForAdding(body);
            let entity = await this.planFacade.addPlanIntoDb(object);
            return res.status(HttpStatus.OK).json({response: entity});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':planId')
    @ApiBearerAuth()
    @Roles('admin')
    @ApiParam({name: "planId", description: "id for finding plan", required: true})
    @ApiBody({
        required: true, type: IPlanCreateProps,
    })
    @ApiResponse({ status: 202, description: "Updateing plan info", type: Plan, isArray: true })
    @ApiOperation({ description: "update plan info.", operationId: "updaetPlanInfo", summary: "Update plan info" })
    public async updatePlan(@Req() req, @Res() res: Response, 
        @Param("planId") planId: string,
        @Body() body: IPlanCreateProps
    ) {
        try {
            let response = await this.commonService.updateEntity(this.Repositories.PLAN, { id: planId }, body)
            res.status(HttpStatus.ACCEPTED).json(response);
        } catch (err) {
            errorResponse(res, err, HttpStatus.BAD_REQUEST);
        }
    }

    @Patch(':planId/status')
    @ApiBearerAuth()
    @Roles('admin')
    @ApiParam({name: "planId", description: "id for finding plan", required: true})
    @ApiBody({
        required: true,
        type: UpdatePlanStatus
    })
    @ApiResponse({ status: 202, description: "Changing plan status" })
    @ApiOperation({ description: "change plan status.", operationId: "changePlanStatus", summary: "Change plan status" })
    public async updatePlanStatus(@Req() req, @Res() res: Response,
        @Param('planId') planId: string,
        @Body() body: UpdatePlanStatus
    ) {
        try {
            if (!planId) return HelperClass.throwErrorHelper('plan:youShouldPassPlanIdParameter');
            if (body.status == undefined) return HelperClass.throwErrorHelper('plan:youShouldPassStatusParameter');
            let plan: any = await this.planFacade.getPlanByPlanId(planId);
            if (!plan) return HelperClass.throwErrorHelper('plan:planWithThisIdDoesNotExist');
            let updatedPlan: any = await this.planFacade.updatePlanStatus(planId, body.status);
            res.status(HttpStatus.ACCEPTED).json({ plan: updatedPlan });
        } catch (err) {
            errorResponse(res, err, HttpStatus.BAD_REQUEST);
        }
    }

    @Delete(':planId')
    @ApiBearerAuth()
    @Roles("admin")
    @ApiParam({name: "planId", description: "id for finding plan", required: true})
    @ApiResponse({status: 200, description: "Successful plan deleting"})
    public async deletePlanByAdmin(@Req() req, @Res() res: Response, @Param('planId') planId: string) {
        try {
            if (!planId) await HelperClass.throwErrorHelper('plan:youShouldPassPlanId');
            let plan = await this.planFacade.getPlanByPlanId(planId);
            if (!plan) await HelperClass.throwErrorHelper('plan:thisPlanIsNotExist');
            let entity = await this.planFacade.deletePlanFromDb(planId);
            return res.status(HttpStatus.OK).json({response: entity});
        } catch (err) {
            errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
        }
    }
}