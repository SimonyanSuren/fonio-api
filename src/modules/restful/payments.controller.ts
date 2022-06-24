import {
  Controller,
  HttpStatus,
  Req,
  Res,
  Post,
  Get,
  Body,
  Headers,
  Param,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { OpentactService } from '../opentact';
import { OpentactAuth } from '../opentact';
import { PaymentSystems } from '../../models/payment.entity';
import { AccountNumberFacade, OrderFacade } from '../facade';
import { PaymentsService, CreatePayment } from '../payments';
import { PaymentOrder } from '../../util/swagger';
import { OrderDids } from '../../util/swagger/order_did';
import { errorResponse } from '../../filters/errorRespone';
import { EmailService } from '../email';

@Controller('payments')
@ApiBearerAuth()
@ApiTags('Payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private opentactAuth: OpentactAuth,
    private orderFacade: OrderFacade,
    private opentactService: OpentactService,
    private emailService: EmailService,
    private accountNumberFacade: AccountNumberFacade,
  ) {}

  @Post('order_did')
  @ApiBody({
    type: OrderDids,
    required: true,
  })
  @ApiOperation({
    description: 'Order did number to create payments for Paypal and Stripe',
  })
  @ApiResponse({ status: 200, description: 'Get order uuid' })
  public async OrderDids(
    @Req() req,
    @Res() res: Response,
    @Body() body: OrderDids,
  ) {
    try {
      const userUuid = req.user.userUuid;
      let userToken = await this.opentactService.getToken();
      const order = await this.opentactService.buyDidNumbers(
        userToken.payload.token,
        body.numbers,
      );

      if (order.error) {
        return res.status(order.error.status).json(order);
      }

      const newOrder = await this.orderFacade.saveOrder(
        order.payload,
        userUuid,
      );

      return res.status(201).json(newOrder);
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('buy_did_number')
  @ApiOperation({ description: 'Buy DID number through Paypal and Stripe' })
  @ApiResponse({
    status: 200,
    description: 'Get payment page url and payment id',
  })
  public async createPayment(
    @Req() req,
    @Res() res: Response,
    @Body() body: CreatePayment,
  ) {
    try {
      const { userId, userUuid, userEmail, companyId } = req.user;
      const { paymentType, orderUuid, planID, ...rest } = body;

      let didNumbers, order, tnArray;

      order = await this.orderFacade.getUserOrder(orderUuid, userUuid);

      if (!order) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Order does not exist',
          status: 'not exist',
          success: false,
          failed: true,
        });
      }

      if (order.done) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Order is already done',
          status: 'done',
          success: false,
          failed: true,
        });
      }

      let userToken = await this.opentactAuth.getToken();

      didNumbers = await this.opentactService.getDidOrderByUuid(
        userToken.payload.token,
        orderUuid,
      );

      if (didNumbers.error) {
        return res.status(didNumbers.error.status).json(didNumbers);
      }

      if (didNumbers.payload.success && didNumbers.payload.failed) {
        let failedDidNumbers = didNumbers.payload.tn_items
          .filter((tn) => tn.state === 'failed')
          .map((tn) => tn.reason);
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Buying number is failed. ${failedDidNumbers}`,
          status: 'failed',
          success: false,
          failed: true,
        });
      }

      if (didNumbers.payload.failed || didNumbers.payload.state === 'failed') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `Buying number is failed.`,
          status: 'failed',
          success: false,
          failed: true,
        });
      }

      if (
        !didNumbers.payload.success &&
        didNumbers.payload.state !== 'success'
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Order is not fulfilled yet. Please wait.',
          status: 'waiting',
          success: false,
          failed: false,
        });
      }

      tnArray = didNumbers.payload.request.items;

      const { amount } =
        await this.accountNumberFacade.countTrackingNumberPrice(
          tnArray,
          rest.durationUnit,
          rest.duration,
        );

      const payment = await this.paymentsService.createPayment({
        paymentType,
        amount,
        planID,
        numberQuantity: tnArray.length,
        tnArray,
        ...rest,
        userUuid,
        userEmail,
      });

      if (payment.error) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message:
            payment.error === '404'
              ? `Payment responde with status ${payment.error}`
              : payment.error,
        });
      }

      await this.paymentsService.storePaymentData(payment.id, {
        userId,
        planID,
        companyId,
        amount,
        paymentType,
        numbers: tnArray,
        ...rest,
      });

      return res.status(HttpStatus.OK).json({
        paymentId: payment.id,
        paymentUrl: payment.url,
      });
    } catch (err) {
      errorResponse(res, err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('payment_approval_url/:service/:orderId')
  @ApiOperation({ description: 'get payment approval url' })
  @ApiResponse({
    status: 200,
    description: 'returns the payment ,approval url',
  })
  @ApiParam({ name: 'orderId', description: 'payment order id' })
  @ApiParam({
    name: 'service',
    description: "payment service name. expects 'paypal' or 'stripe'",
  })
  public async getPaymentApprovalUrl(
    @Req() req,
    @Res() res: Response,
    @Param('orderId') orderId: string,
    @Param('service') service: string,
  ) {
    let url = await this.paymentsService.approvalUrl(service, orderId);
    return res.status(HttpStatus.OK).json(url);
  }

  @Post('execute_paypal_payments')
  @ApiOperation({ description: 'execute payments for Paypal' })
  @ApiResponse({ status: 200, description: 'returns succes: true/false' })
  @ApiBody({
    required: true,
    type: PaymentOrder,
    // name: "paymeny/ orderID"
  })
  public async executePaypalPayment(
    @Req() req,
    @Res() res: Response,
    @Body() body: PaymentOrder,
  ) {
    let response = await this.paymentsService.executePayment({
      body,
      type: 'paypal',
    });
    return res.status(HttpStatus.OK).json(response);
  }

  @Post('execute_stripe_payments')
  @ApiOperation({ description: 'Webhook for stripe events' })
  @ApiResponse({
    status: 200,
    description:
      'return response with 2xx status code for success verification or 4xx for failed. Fullfill payment for Did numbers.',
  })
  public async executeStripePayment(
    @Headers('stripe-signature') signature,
    @Req() req,
    @Res() res: Response,
  ) {
    let response = await this.paymentsService.executePayment({
      sig: signature,
      body: req.rawBody,
      type: PaymentSystems.STRIPE,
    });
    console.log(' \x1b[41m ', response, ' [0m ');
    if (response?.success) {
      return res.status(HttpStatus.OK).json(response);
    }
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
}
