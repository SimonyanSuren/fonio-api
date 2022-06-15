'use strict';

import { join } from 'path';
import {
  Inject,
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  Post,
  Patch,
  Param,
  Put,
  Delete,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { UserFacade, CompanyFacade, OrderFacade } from '../facade';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { errorResponse } from '../../filters/errorRespone';
import { HelperClass } from '../../filters/Helper';
import { UserPatchMethod } from '../../util/swagger';
import { MessageCodeError } from '../../util/error';
import { AccountNumberFacade } from '../facade';
import { EmailService } from '../email';
import { CommonService } from '../services/common.service';
import { PermissionsService } from '../services/permissions.service';
import { Repositories } from '../db/repositories';
import { OpentactService } from '../opentact';
import constants from '../../constants';
import { BuyDidNumbers, PaymentsService } from '../payments';
import { SendSmsReq } from '../../util/swagger/send_sms';
import { OpentactAuth } from '../opentact';
import { OrderDids } from '../../util/swagger/order_did';
import { UpdatePassword, ChangeUserPassword } from '../../util/swagger';
import { PasswordHelper } from '../../util/helper';
import { compare as comparePassword, genSaltSync, hashSync } from 'bcrypt';
import { Config } from '../../util/config';
import { UserTypes } from '../../models';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(
    @Inject('Repositories')
    private readonly Repositories: Repositories,
    private paymentsService: PaymentsService,
    private userFacade: UserFacade,
    private companyFacade: CompanyFacade,
    private opentactAuth: OpentactAuth,
    private opentactService: OpentactService,
    private orderFacade: OrderFacade,
    private emailService: EmailService,
    private accountNumberFacade: AccountNumberFacade,
    private commonService: CommonService,
    private permissionsService: PermissionsService,
  ) {}

  // @Get('/list/byAccount')
  // @ApiOperation({ description: "Get user list of account.", summary: "Get user list of account" })
  // @ApiQuery({ name: "company", description: "company name", required: false, type: String })
  // public async getUserListByAccId(@Req() req, @Query("company") company: string, @Res() res: Response) {
  //     try {
  //         let { accountId } = req.user;
  //         let users: any = await this.userFacade.getUserListByAccId(accountId, company);
  //         return res.status(HttpStatus.OK).json({
  //             response: users
  //         });
  //     } catch (err) {
  //         errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
  //     }
  // }

  @Get('/list/byCompany/:id')
  @ApiParam({
    name: 'id',
    description: 'company id',
    required: true,
    type: Number,
  })
  @ApiOperation({
    description: 'Get user list of company.',
    summary: 'Get user list of company',
  })
  public async getUserListByCompId(
    @Req() req,
    @Param('id') id: number,
    @Res() res: Response,
  ) {
    try {
      let uuid;
      const user_company = await this.companyFacade.getCompanyById(
        req.user.userid,
        id,
      );
      if (!user_company.company) {
        await HelperClass.throwErrorHelper('company:notFound');
      } else uuid = user_company.company.companyUuid;

      let users: any = await this.userFacade.getUserListByCompUuid(uuid);
      return res.status(HttpStatus.OK).json({
        response: users,
      });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({
    description: 'Get current company.',
    summary: 'Get user infotmation',
  })
  public async getUserInformation(@Req() req, @Res() res: Response) {
    try {
      let { userId, companyId } = req.user;
      let user: any = await this.userFacade.getUserById(userId, companyId);
      if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
      return res.status(HttpStatus.OK).json({
        response: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          twoFA: user.twoFA,
          imgLink: user.link,
        },
      });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    description: 'id for getting user info',
    required: true,
    type: Number,
  })
  @ApiBody({
    type: UserPatchMethod,
    required: true,
  })
  @ApiOperation({ description: 'Edit user account', summary: 'Put account' })
  public async putUserInformation(
    @Req() req,
    @Res() res: Response,
    @Param('id') id,
  ) {
    try {
      let {
        email,
        firstName,
        lastName,
        twoFA,
        password,
        rePassword,
        machineDetection,
        forwardSoftphone,
        logoUuid,
        companyName,
      } = req.body;
      let user: any = await this.userFacade.getUserById(id, req.user.companyId);
      if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
      let emailField = email ? email : user.email;
      let firstNameField = firstName ? firstName : user.firstName;
      let lastNameField = lastName ? lastName : user.lastName;
      let companyNameField = companyName ? companyName : user.companyName;
      let twoFaField = user.twoFA;
      if (twoFA != undefined) twoFaField = twoFA;
      let machineDetectionField = user.machineDetection;
      if (machineDetection != undefined)
        machineDetectionField = machineDetection;
      let forwardSoftphoneField = user.twoFA;
      if (forwardSoftphone != undefined)
        forwardSoftphoneField = forwardSoftphone;
      if (password !== rePassword)
        throw new MessageCodeError('rePassword:NotMatch');

      let response = await this.userFacade.updateUserFieldsEntity(
        id,
        emailField,
        firstNameField,
        lastNameField,
        twoFaField,
        password,
        machineDetectionField,
        forwardSoftphoneField,
        companyNameField,
      );
      return res.status(HttpStatus.OK).json({ response: response });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch()
  @ApiBody({
    type: UserPatchMethod,
    required: true,
  })
  @ApiOperation({ description: 'Edit user account', summary: 'Patch account' })
  public async patchUserInformation(@Req() req, @Res() res: Response) {
    try {
      let { userId, companyId } = req.user;
      let {
        email,
        firstName,
        lastName,
        twoFA,
        password,
        rePassword,
        machineDetection,
        forwardSoftphone,
        logoUuid,
        companyName,
      } = req.body;
      let user: any = await this.userFacade.getUserById(userId, companyId);
      if (!user) await HelperClass.throwErrorHelper('user:thisUserDoNotExist');
      let emailField = email ? email : user.email;
      let firstNameField = firstName ? firstName : user.firstName;
      let lastNameField = lastName ? lastName : user.lastName;
      let companyNameField = companyName ? companyName : user.companyName;
      let twoFaField = user.twoFA;
      if (twoFA != undefined) twoFaField = twoFA;
      let machineDetectionField = user.machineDetection;
      if (machineDetection != undefined)
        machineDetectionField = machineDetection;
      let forwardSoftphoneField = user.twoFA;
      if (forwardSoftphone != undefined)
        forwardSoftphoneField = forwardSoftphone;
      if (password !== rePassword)
        throw new MessageCodeError('rePassword:NotMatch');

      let response = await this.userFacade.updateUserFieldsEntity(
        userId,
        emailField,
        firstNameField,
        lastNameField,
        twoFaField,
        password,
        machineDetectionField,
        forwardSoftphoneField,
        companyNameField,
      );
      return res.status(HttpStatus.OK).json({ response: response });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':uuid/companies')
  @ApiParam({
    name: 'uuid',
    description: 'user uuid',
    required: true,
    type: String,
  })
  @ApiOperation({
    description: 'Get company informations.',
    operationId: 'getCompanies',
    summary: 'Get company infotmations',
  })
  public async getCompanies(
    @Req() req,
    @Param('uuid') uuid: string,
    @Res() res: Response,
  ) {
    try {
      const user = await this.userFacade.getUserByUuid(uuid);
      if (!user) {
        await HelperClass.throwErrorHelper('user:userWithThisUuidIsNotExist');
      }
      const companies = await this.companyFacade.getAllCompaniesByUserCreator(
        user?.id,
      );
      return res.status(HttpStatus.OK).json(companies);
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    description: 'user id',
    required: true,
    type: String,
  })
  @ApiOperation({ description: 'Delete user' })
  public async deleteUser(
    @Req() req,
    @Param('id') id: number,
    @Res() res: Response,
  ): Promise<any> {
    let where = { id };
    await this.permissionsService.checkPermissions({
      userData: req.user,
      entity: 'user',
      object: where,
    });
    //TODO: delete sipuser
    const response = await this.commonService.deleteEntity(
      this.Repositories.USERS,
      where,
    );
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('/suspend')
  @ApiOperation({
    description: 'Suspend user.',
    operationId: 'suspendUser',
    summary: 'Suspend user',
  })
  public async suspendUser(@Req() req, @Res() res: Response) {
    try {
      let token = await this.opentactAuth.adminLoginGettignToken();
      let tracking_numbers = (
        await this.accountNumberFacade.getTrackingNumbers(
          req.user.userId,
          req.user.companyId,
          undefined,
        )
      )[0];
      for (let i = 0; i < tracking_numbers.length; i++) {
        let did = tracking_numbers[i].did;
        if (did != undefined) {
          await this.userFacade.suspendUser(
            req.user,
            token.token,
            did.didOpentactIdentityID,
            did.id,
            tracking_numbers[i].id,
          );
        }
      }
      if (tracking_numbers.length == 0)
        await this.userFacade.suspendUser(
          req.user,
          undefined,
          undefined,
          undefined,
          undefined,
        );
      res.status(HttpStatus.OK).json({ response: 'ok' });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/close')
  @ApiOperation({
    description: 'Close user.',
    operationId: 'closeUser',
    summary: 'Close user',
  })
  public async closeUser(@Req() req, @Res() res: Response) {
    try {
      let token = await this.opentactAuth.adminLoginGettignToken();
      let tracking_numbers = (
        await this.accountNumberFacade.getTrackingNumbers(
          req.user.userId,
          req.user.companyId,
          undefined,
        )
      )[0];
      for (let i = 0; i < tracking_numbers.length; i++) {
        let did = tracking_numbers[i].did;
        if (did != undefined) {
          await this.userFacade.closeUser(
            req.user,
            token.token,
            did.didOpentactIdentityID,
            did.id,
            tracking_numbers[i].id,
          );
        }
      }
      if (tracking_numbers.length == 0)
        await this.userFacade.closeUser(
          req.user,
          undefined,
          undefined,
          undefined,
          undefined,
        );

      res.status(HttpStatus.OK).json({ response: 'ok' });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('image/:image')
  @ApiParam({ name: 'image', description: 'image name' })
  @ApiOperation({ description: 'Get user image' })
  public async getUserImage(
    @Req() req,
    @Res() res: Response,
    @Param('image') image: string,
  ) {
    try {
      if (!image.includes(req.user.userUuid))
        res.status(404).send({ message: 'image not found' });

      res.sendFile(
        join(process.cwd(), `${constants.PATH_TO_IMAGE_FOLDER}/${image}`),
        function (err) {
          if (err) {
            return res.status(404).end();
          }
        },
      );
    } catch (e) {
      return res.status(404).send({ message: e.message });
    }
  }

  @Get('recordings/:record')
  @ApiParam({
    name: 'record',
    description: 'user record name',
    required: true,
    type: String,
  })
  public async getUserRecords(
    @Req() req,
    @Res() res: Response,
    @Param('record') record,
  ) {
    try {
      let mode = process.env.NODE_ENV === 'development' ? 'dev' : 'prod';
      res.sendFile(
        join(process.cwd(), `/assets/${mode}/recordings/${record}`),
        function (err) {
          if (err || !record.includes(req.user.userUuid)) {
            return res.status(404).end();
          }
        },
      );
    } catch (e) {
      return res.status(404).send({ message: e.message });
    }
  }

  @Post('order_did_number')
  @ApiOperation({ description: 'Order number' })
  @ApiResponse({ status: 200, description: 'id' })
  @ApiBody({
    required: true,
    type: OrderDids,
  })
  public async orderDidNumber(@Req() req, @Res() res: Response, @Body() body) {
    try {
      let userToken = await this.opentactService.getToken();

      let order = await this.opentactService.buyDidNumbers(
        userToken.payload.token,
        body.numbers,
      );

      if (order.error) {
        return res.status(order.error.status).json(order);
      }
console.log(" \x1b[41m ", order.payload.state , " [0m " )
      let new_order = await this.orderFacade.saveOrder(
        order.payload,
        req.user.userUuid,
      );
      return res.status(201).json(new_order);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message });
    }
  } 

  @Post('buy_did_number')
  @ApiOperation({ description: 'Buy number' })
  @ApiResponse({ status: 200, description: 'id' })
  @ApiBody({
    required: true,
    type: BuyDidNumbers,
  })
  public async buyDidNumber(
    @Req() req,
    @Res() res: Response,
    @Body() body//: BuyDidNumbers,
  ) {
    try {
      const {
        paymentType,
        amount,
        orderUuid,
        additionalNumbers,
        planID,
        ...rest
      } = body;

      let userID = req.user?.userId,
        companyID = req.user?.companyId,
        numbers = additionalNumbers,
        didNumbers,
        userNumbers,
        company,
        buy_failed,
        buy_state,
        order_uuid = orderUuid;

      let order = await this.orderFacade.getUserOrder(
        orderUuid,
        req.user.userUuid,
      );
		console.log(" \x1b[41m ", req.user.userUuid , " [0m " )
      if (!order)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            message: 'Order does not exist',
            status: 'not exist',
            success: false,
            failed: true,
          });
      if (order.done)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            message: 'Order is already done',
            status: 'done',
            success: false,
            failed: true,
          });

      let userToken = await this.opentactAuth.getToken();
console.log(" \x1b[41m ", userToken , " [0m " )
      didNumbers = await this.opentactService.getDidOrderByUuid(
        userToken.payload.token,
        order_uuid,
      );
console.log(" \x1b[41m ", didNumbers , " [0m " )
      if (didNumbers.error) {
        return res.status(didNumbers.error.status).json(didNumbers);
      }

      buy_failed = didNumbers.payload.failed;
      buy_state = didNumbers.payload.state;
      if (didNumbers.payload.failed || didNumbers.payload.state === 'failed') {
        await this.orderFacade.getUserOrder(orderUuid, req.user.userUuid);
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            message: 'Buying number is failed.',
            status: 'failed',
            success: false,
            failed: true,
          });
      } 
      if (
        !didNumbers.payload.success &&
        didNumbers.payload.state !== 'success'
      ) {
        return res
          .status(HttpStatus.BAD_REQUEST) 
          .json({
            message: 'Order is not fulfilled yet. Please wait.',
            status: 'waiting',
            success: false,
            failed: false,
          });
      }

      let tnArray = didNumbers.payload.request?.items || numbers;

      let response = await this.paymentsService.createPayment({
        paymentType,
        amount,
        companyID,
        planID,
        numberQuantity: tnArray.length,
        ...rest,
      });
      if (response.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({
            message:
              response.error === '404'
                ? `Payment responde with status ${response.error}`
                : response.error,
          });
      }

      company = await this.userFacade.getCompanyByUserId(userID);

      await this.paymentsService.storePaymentData(response.paymentID, {
        ...rest,
        paymentType,
        amount,
        planID,
        userID,
        companyID,
        numbers: tnArray,
      });

      if (tnArray) {
        userNumbers = await this.accountNumberFacade.addDidNumbers(
          userID,
          companyID,
          true,
          tnArray,
          company,
          planID,
        );
        if (userNumbers.error) {
          return res.status(HttpStatus.BAD_REQUEST).json(userNumbers.error);
        }
      }

      return res
        .status(HttpStatus.OK)
        .json({
          ...response,
          ...{ numbers: userNumbers },
          ...{ userID, companyID, planID, companyUuid: company.companyUuid },
          ...{ buy_failed, buy_state, order_uuid },
        });
    } catch (err) {
      throw new Error(err.message);
    }
  }

  @Post('sms')
  @ApiOperation({ description: 'Send sms' })
  @ApiResponse({ status: 200, description: 'sms' })
  @ApiBody({
    required: true,
    type: SendSmsReq,
  })
  public async sendSms(
    @Req() req,
    @Res() res: Response,
    @Body() body: SendSmsReq,
  ) {
    try {
      const { from, to, message } = body;
      const { token } = (await this.opentactAuth.getToken()).payload;

      let own_number = await this.accountNumberFacade.ownNumber(
        req.user.userId,
        req.user.companyId,
        body.from,
      );
      if (!own_number)
        return res.status(401).send('From number does not belong to you.');

      const sms = await this.opentactService.sendSms(token, from, to, message);

      return res.status(200).send({ sms });
    } catch (e) {
      console.log(e);
      return res.status(400).send({ message: e.message });
    }
  }

  @ApiBody({
    required: true,
    type: UpdatePassword,
  })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @Patch('password')
  public async setPassword(@Req() req, @Res() res: Response) {
    try {
      const { originalPassword, newPassword, rePassword } = req.body;

      if (!originalPassword)
        await HelperClass.throwErrorHelper('You should pass original password');
      if (!newPassword)
        await HelperClass.throwErrorHelper('You should pass new password');
      if (newPassword !== rePassword)
        await HelperClass.throwErrorHelper('Password does not match');

      const user = await this.userFacade.getUserByUuid(req.user.userUuid);

      if (!user) {
        await HelperClass.throwErrorHelper('user:userWithThisUuidIsNotExist');
      }

      const isEqual = await await comparePassword(
        originalPassword,
        user?.password ? user.password : '',
      );

      if (!isEqual)
        await HelperClass.throwErrorHelper('Original password is incorrect');

      await PasswordHelper.validatePassword(newPassword);

      const salt = genSaltSync(Config.number('BCRYPT_SALT_ROUNDS', 10));
      const hash = hashSync(newPassword, salt);

      await this.userFacade.updatePassword(hash, req.user.userUuid);

      return res.status(200).json({
        response: {
          message: 'Successfully updated',
        },
      });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBody({
    required: true,
    type: ChangeUserPassword,
  })
  @ApiResponse({ status: 200, description: 'Password successfully changed' })
  @ApiParam({
    name: 'uuid',
    description: 'user uuid',
    required: true,
    type: String,
  })
  @Patch('user/:uuid/password')
  public async setCompanyUserPassword(
    @Req() req,
    @Res() res: Response,
    @Param('uuid') uuid: string,
  ) {
    try {
      const { newPassword, rePassword } = req.body;

      if (!newPassword)
        await HelperClass.throwErrorHelper('You should pass new password');
      if (newPassword !== rePassword)
        await HelperClass.throwErrorHelper('Password does not match');

      if (req.user.userType != UserTypes.COMPANY_ADMIN) {
        await HelperClass.throwErrorHelper('User is not company admin');
      }

      await PasswordHelper.validatePassword(newPassword);

      const salt = genSaltSync(Config.number('BCRYPT_SALT_ROUNDS', 10));
      const hash = hashSync(newPassword, salt);

      await this.userFacade.updatePassword(hash, uuid);

      return res.status(200).json({
        response: {
          message: 'Successfully updated',
        },
      });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
