import { Injectable, Inject } from '@nestjs/common';
import constants from "../../constants";
import axios from "axios";
import Stripe from "stripe";
import { PaymentsRepository } from '../db/repositories/payments.repository'
import { DidsRepository } from '../db/repositories/did.repository';
import { OpentactService } from '../opentact';
import { BaseService } from '../services/base.service'
import { HelperClass } from "../../filters/Helper";
import { AuthService } from '../auth';
import { Transactional } from "typeorm-transactional-cls-hooked"
import { CompanyFacade, DidFacade } from '../facade';
import { Repositories } from '../db/repositories';
import moment = require('moment');
import { EntityManager } from 'typeorm';

@Injectable()
export class PaymentsService extends BaseService {
    stripe: Stripe;
    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories,
        @Inject('PaymentsRepository')
        private readonly paymentsRepository: PaymentsRepository,
        private readonly companyFacade: CompanyFacade,
        private readonly opentactService: OpentactService,
        private readonly didFacade: DidFacade,
        private authService: AuthService,

    ) {
        super()
        this.stripe = new Stripe(constants.STRIPE_SECRET, { apiVersion: '2020-08-27', typescript: true, });
    }

    private async createPaypalPayment({ total_amount, items }) {
        const response = await axios.post(
            constants.PAYPAL_API + "/v2/checkout/orders",
            {
                intent: "CAPTURE",
                purchase_units: [{
                    amount: {
                        value: total_amount,
                        currency_code: "USD",
                    },
                }],
                order_application_context: {
                    return_url: constants.PAYMENT_SUCCESS_URL,
                    cancel_url: constants.PAYMENT_CANCEL_URL,
                },
            },
            {
                auth: {
                    username: constants.PAYPAL_CLIENT,
                    password: constants.PAYPAL_SECRET
                }
            },
        )
        return response.data.id
    }

    private async createStripePayment({ items }) {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: items,
            mode: "payment",
            success_url: constants.PAYMENT_SUCCESS_URL,
            cancel_url: constants.PAYMENT_CANCEL_URL,
        });
        return session.id
    }

    private async paymentSucceed({ transactionId }) {
        const updatedPayment = await this.updateEntity(this.Repositories.PAYMENTS, { transactionId }, { success: true });
        const updatedUser = await this.updateEntity(this.Repositories.USERS, { id: updatedPayment.userId }, { status: true });
        const numArr = updatedPayment.numbers?.map(num => JSON.parse(num).tn);
        
        const { unitAmount, planId, isMonth, duration } = updatedPayment;
        const defDuration = await this.getDurationFromAmount(unitAmount, planId, isMonth, duration);
        const months = defDuration * duration;

        await this.updateDidExpiration(numArr, months)
        // NEED TO UPDATE DID EXPIRATION DATE HERE

        return updatedUser;
    }

    private async updateDidExpiration(numbersArray, months) {
        let expiration = moment(Date.now()).add(months, 'M').toISOString();
        let expireOn = new Date(expiration);

        await this.didFacade.updateExpirationByNumbers(numbersArray, expireOn);
    }

    @Transactional()
    public async createUser(register) {
        try {

            const user: any = await this.authService.signUp(register);
            if (user.error) {
                return { user: { error: user.error }}
            }
            if (!user) await HelperClass.throwErrorHelper('auth:BadRequest');
            //TODO check unique login fro sipUser
            const login = `${register.firstName}_${register.lastName}_${Date.now()}`;
            const sipUser = await this.opentactService.createSipUser({
                login,
                password: register.password,
            })
            if (user.user) {
                const updatedUser = await this.updateEntity(this.Repositories.USERS, { id: user.user.id }, { sipUsername: login })
            }
            if (user.company && user.user) {
                const createdTokens = await this.companyFacade.saveToken(login, register.password, user.user)
            }
            return { user }
        } catch (e) {
            return { user: { error: e.message }}
        }
    }

    private async getDurationFromAmount(amount, planID, is_month, duration) {
        if (!duration) {
            throw new Error("Please provide duration greater than 0");
        }
        if (!planID) {
            throw new Error("Missing plan id");
        }
        const plan = await this.getEntity(this.Repositories.PLAN, { id: planID, status: true });
        if (!plan) {
            throw new Error("No such plan");
        }
        let defDuration
        console.log(plan, amount, is_month)
        switch (+amount) {
            case (plan.annuallyAmount): defDuration = 12
                break
            case (plan.monthlyAmount): defDuration = 1
                break
            default: throw new Error("Incorrect amount");
        }

        if ((defDuration === 12 && is_month) || (defDuration === 1 && !is_month)) {
            throw new Error("Incorrect amount");
        }

        return defDuration;
    }

    public async createPayment(data) {
        try {
            let paymentId;
            await this.getDurationFromAmount(data.amount, data.planID, data.is_month, data.duration);
            if (data.paymentType === 'paypal') {
                const { items, total_amount } = await this.prepareDataPaypal(data.amount, data.numberQuantity, data.duration)
                paymentId = await this.createPaypalPayment({ total_amount, items })
            } else
                if (data.paymentType === 'stripe') {
                    const { items, total_amount } = await this.prepareDataStripe(data.amount, data.numberQuantity, data.duration)
                    paymentId = await this.createStripePayment({ items })
                }

            return { paymentID: paymentId }

        } catch (e) {
            console.error(e)
            return { error: e.message, status: e.status }
        };
    }

    public async storePaymentData(paymentId, data) {
        const paymentBody = {
            transactionId: paymentId,
            payWith: data.paymentType,
            userId: data.userID,
            companyId: data.companyID,
            amount: (data.amount * data.numbers.length * data.duration),
            isMonth: data.is_month,
            unitAmount: data.amount,
            duration: data.duration,
            numbers: data.numbers,
            planId: data.planID,
        }
        return await this.paymentsRepository.create(paymentBody);
    }

    private async prepareDataPaypal(amount, numberQuantity, duration) {
        const items = [
            {
                name: 'top up',
                currency: "USD",
                description: 'top up your balance',
                quantity: numberQuantity,
                unit_amount: amount,
                duration,
            }
        ]
        const total_amount = amount * numberQuantity * duration;

        return { total_amount, items }
    }

    private async prepareDataStripe(amount, numberQuantity, duration) {

        const items = [{
            price_data: {
                currency: "usd",
                product_data: {
                    name: 'top up your balance',
                    // images: [
                    //   "https://ejphaq.stripocdn.email/content/guids/CABINET_fd920fd33be400d498bd92fecc8203fc/images/39921582644799675.PNG",
                    // ],
                },
                unit_amount: amount * 100,
            },
            quantity: numberQuantity,
            description: 'top up your balance',
            duration,
        }];

        const total_amount = amount * numberQuantity;

        return { total_amount, items }
    }

    private async executePaypalPayment({ body, sig }) {
        try {

            const orderID = body.orderId;

            const response = await axios.post(
                constants.PAYPAL_API + `/v2/checkout/orders/${orderID}/capture`,
                {
                },
                {
                    auth: {
                        username: constants.PAYPAL_CLIENT,
                        password: constants.PAYPAL_SECRET
                    }
                })

            if (response.data.body?.name === "VALIDATION_ERROR") {
                console.error(response.data.body.details);
                return { success: false }
            } else if (response.data.status === 'COMPLETED') {
                return { success: true }
            } else {
                return { success: false }
            }

        } catch (e) {
            console.error(e)
            throw e
        };
    }


    private async executeStripePayment({ body, sig }) {
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(body, sig, constants.STRIPE_WEBHOOK_SECRET);

            if (event.type === "checkout.session.completed") {
                return { success: true, id: event.data.object.id }
            } else {
                return { success: false }
            }
        } catch (e) {
            console.error(e)
            throw e
        };
    }

    public async executePayment({ body, sig = undefined, type }) {
        let payment
        let transactionId
        if (type === 'paypal') {
            payment = await this.executePaypalPayment({ body, sig, })
            transactionId = body.orderID
        }
        else if (type === 'stripe') {
            const { success, id } = await this.executeStripePayment({ body, sig, })
            payment = { success }
            transactionId = id
        }
        if (transactionId) {
            const result = await this.paymentSucceed({ transactionId })
        }
        return payment
    }

    public async approvalUrl(service, orderID) {
        if (service === 'paypal') {
            const response = await axios.get(
                constants.PAYPAL_API + `/v2/checkout/orders/${orderID}`,
                {
                    auth: {
                        username: constants.PAYPAL_CLIENT,
                        password: constants.PAYPAL_SECRET
                    }
                });
    
            return response.data.links.find(link => link.rel === 'approve');
        } else if (service === 'stripe') {
            const session = await this.stripe.checkout.sessions.retrieve(
                orderID, 
                {
                    apiKey: constants.STRIPE_SECRET,
                });

            return session['url'];
        }
    }

}
