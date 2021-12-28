import { Controller, HttpStatus, Req, Res, Post, Get, Body, Headers, Param } from '@nestjs/common';
import { ApiResponse, ApiBearerAuth, ApiTags, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { PaymentsService, CreatePayment } from "../payments";
import { PaymentOrder } from '../../util/swagger';
import { EmailService } from '../email';
import { OpentactService } from '../opentact';
import { AccountNumberFacade, OrderFacade } from '../facade';
import { OpentactAuth } from '../opentact';
import { OrderDid } from '../../util/swagger/order_did';

@Controller('payments')
@ApiBearerAuth()
@ApiTags("Payments")
export class PaymentsController {
    constructor(private paymentsService: PaymentsService,
        private opentactAuth: OpentactAuth,
        private orderFacade: OrderFacade,
        private opentactService: OpentactService,
        private emailService: EmailService,
        private accountNumberFacade: AccountNumberFacade,
    ) { }

    @Post('order_did/:tempUuid')
    @ApiParam({ name: 'tempUuid', description: 'This is temporary uuid that has been used to connect the Callify socket' })
    @ApiBody({
        type: OrderDid
    })
    @ApiOperation({ description: "order did number to create payments for Paypal and Stripe", })
    @ApiResponse({ status: 200, description: "order_did" })
    public async orderDid(@Req() req, @Res() res: Response,
        @Param('tempUuid') tempUuid: string,
        @Body() body: OrderDid,
    ) {
        try {
            if (!tempUuid.match(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'invalid uuid format' });
            }

            let userToken = await this.opentactService.getToken();
            let order = await this.opentactService.buyDidNumbers(userToken.payload.token, body);

            if (order.error) {
                return res.status(order.error.status).json(order);
            }

            let new_order = await this.orderFacade.saveOrder(order.payload, tempUuid);
            return res.status(201).json(new_order);
        } catch (err) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: err.message })
        }
    }

    @Post('create_payments')
    @ApiOperation({ description: "create payments for Paypal and Stripe", })
    @ApiResponse({ status: 200, description: "id" })
    public async createPayment(@Req() req, @Res() res: Response, @Body() body: CreatePayment) {
        try {

            const { register, orderUuid, tempUuid, ...rest } = body;

            let userID,
                companyID,
                didNumbers,
                userNumbers,
                company,
                buy_failed,
                buy_state,
                order_uuid = orderUuid,
                numbers = register.did_numbers,
                planID = register.planID;

            let order = await this.orderFacade.getUserOrder(orderUuid, tempUuid);
            if (!order) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Order does not exist', status: 'not exist', success: false, failed: true });
            if (order.done) return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Order is already done', status: 'done', success: false, failed: true });

            let userToken = await this.opentactAuth.getToken();
            
            didNumbers = await this.opentactService.getDidOrderByUuid(userToken.payload.token, orderUuid);
            
            if (didNumbers.error) {
                return res.status(didNumbers.error.status).json(didNumbers);
            }

            buy_failed = didNumbers.payload.failed;
            buy_state = didNumbers.payload.state;
            if (didNumbers.payload.failed || didNumbers.payload.state === 'failed') {
                await this.orderFacade.getUserOrder(orderUuid, req.user.userUuid);
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Buying number is failed.', status: 'failed', success: false, failed: true })
            }
            if (!didNumbers.payload.success && didNumbers.payload.state !== 'success') {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Order is not fulfilled yet. Please wait.', status: 'waiting', success: false, failed: false })
            }

            let response = await this.paymentsService.createPayment({ ...rest, companyID, planID });
            if (response.error) {
                return res.status(HttpStatus.BAD_REQUEST).send({ message: (response.error === '404') ? `Payment responde with status ${response.error}`: response.error });
            }
            
            const result = await this.paymentsService.createUser(register);
            if (result.user.error) {
                return res.status(HttpStatus.BAD_REQUEST).json(result);
            }
            if (result.user['user']) {
                userID = result.user['user'].id;

                this.emailService.sendMail("auth:signup", result.user['user'].email, {
                    FIRST_NAME: result.user['user'].firstName,
                    LAST_NAME: result.user['user'].lastName,
                    BUTTON: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${result.user['user'].uuid}`,
                    LINK: `${process.env.BASE_URL||process.env.FONIO_URL}/auth/activate?uuid=${result.user['user'].uuid}`,
                    LOGO: `${process.env.BASE_URL||process.env.FONIO_URL}/public/assets/logo.png`
                });
            }
            if (result.user['company']) {
                company = result.user['company'];
                companyID = company.companyId;
            }

            await this.paymentsService.storePaymentData(response.paymentID, { ...rest, userID, companyID, numbers: didNumbers.payload.request?.items||numbers });

            if (didNumbers.payload.request?.items||numbers) {
                userNumbers = await this.accountNumberFacade.addDidNumbers(userID, companyID, true, didNumbers.payload.request?.items||numbers, company, planID);
                if (userNumbers.error) {
                    return res.status(HttpStatus.BAD_REQUEST).json(userNumbers.error);
                }
            }
            return res.status(HttpStatus.OK).json({ ...response, ...{numbers: userNumbers}, ...{userID, companyID, planID, companyUuid: company.companyUuid}, ...{ buy_failed, buy_state, order_uuid } });
        } catch (err) {
            throw new Error(err.message)
        }
    }

    @Get('payment_approval_url/:service/:orderId')
    @ApiOperation({ description: "get payment approval url" })
    @ApiResponse({ status: 200, description: "returns the payment ,approval url" })
    @ApiParam({ name: "orderId", description: "payment order id" })
    @ApiParam({ name: "service", description: "payment service name. expects 'paypal' or 'stripe'" })
    public async getPaymentApprovalUrl(@Req() req, @Res() res: Response, 
        @Param('orderId') orderId: string,
        @Param('service') service: string
    ) {
        let url = await this.paymentsService.approvalUrl(service, orderId);
        return res.status(HttpStatus.OK).json(url);
    }

    @Post('execute_paypal_payments')
    @ApiOperation({ description: "execute payments for Paypal", })
    @ApiResponse({ status: 200, description: "returns succes: true/false" })
    @ApiBody({
        required: true,
        type:PaymentOrder
        // name: "paymeny/ orderID"
    })
    public async executePaypalPayment(@Req() req, @Res() res: Response, @Body() body: PaymentOrder) {
        let response = await this.paymentsService.executePayment({ body, type: 'paypal' });
        return res.status(HttpStatus.OK).json(response);
    }

    @Post('execute_stripe_payments')
    @ApiOperation({ description: "execute payments for Stripe", })
    @ApiResponse({ status: 200, description: "returns succes: true/false" })
    public async executeStripePayment(@Headers('stripe-signature') signature, @Req() req, @Res() res: Response) {
        let response = await this.paymentsService.executePayment({ sig: signature, body: req.rawBody, type: 'stripe' });
        return res.status(HttpStatus.OK).json(response);
    }
}


