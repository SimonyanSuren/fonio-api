'use strict';

import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Req,
  Res,
  Body,
  Delete,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { Contact } from '../../models';
import { ContactFacade } from '../facade';
import { ContactReq } from '../../util/swagger';
import { errorResponse } from '../../filters/errorRespone';
import { ValidationPipe } from '../../util/validatior';

@Controller('contacts')
@ApiTags('Contacts')
@ApiBearerAuth()
export class ContactController {
  constructor(private contactFacade: ContactFacade) {}

  @Post()
  @ApiResponse({ status: 200, description: 'contact created', type: Contact })
  @ApiBody({
    required: true,
    type: ContactReq,
  })
  @ApiOperation({
    description: 'create a contact.',
    operationId: 'createContact',
    summary: 'create a contact',
  })
  public async create(
    @Req() req,
    @Res() res: Response,
    @Body() contactData: ContactReq,
  ) {
    try {
      const user = req.user;
      const contact = await this.contactFacade.create(user, contactData);

      res.status(HttpStatus.OK).json(contact);
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'id', required: true, type: Number })
  @ApiBody({
    required: true,
    type: ContactReq,
  })
  @ApiResponse({ status: 200, description: 'contact updated', type: Contact })
  @ApiOperation({
    description: 'edit contact.',
    operationId: 'editContact',
    summary: 'Edit Contact',
  })
  public async edit(
    @Req() req,
    @Body() contact: ContactReq,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.contactFacade.edit(req.user, id, contact));
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'contact info', type: Contact })
  @ApiOperation({
    description: 'get contact.',
    operationId: 'getContact',
    summary: 'Get Contact',
  })
  public async get(@Req() req, @Res() res: Response, @Param('id') id: number) {
    try {
      res
        .status(HttpStatus.OK)
        .json(await this.contactFacade.get(req.user, id));
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'id', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'contact info', type: Contact })
  @ApiOperation({
    description: 'delete contact.',
    operationId: 'deleteContact',
    summary: 'Delete Contact',
  })
  public async delete(
    @Req() req,
    @Res() res: Response,
    @Param('id') id: number,
  ) {
    try {
      await this.contactFacade.delete(req.user, id);
      res.status(HttpStatus.OK).json({ response: 'ok' });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiQuery({ name: 'userUuid', description: 'user uuid', required: false })
  @ApiQuery({
    name: 'firstName',
    description: 'contact firstName',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'contact info', type: Contact })
  @ApiOperation({
    description: 'get contact list.',
    operationId: 'getContactList',
    summary: 'Get Contact List',
  })
  public async getAll(
    @Req() req,
    @Res() res: Response,
    @Query('userUuid') userUuid: string,
    @Query('firstName') firstName: string,
  ) {
    try {
      let result = await this.contactFacade.getList(req.user, {
        userUuid,
        firstName,
      });
      if (result) {
        result[0].forEach((contact) => {
          contact.assignedTo.password = undefined;
          contact.assignedTo.salt = undefined;
        });

        res
          .status(HttpStatus.OK)
          .json({ response: result[0], entries: result[1] });
      } else res.status(HttpStatus.OK).json({ response: [], entries: 0 });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
