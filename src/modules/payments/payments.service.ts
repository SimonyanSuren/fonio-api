import { Injectable, Inject } from '@nestjs/common';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import axios from 'axios';
import Stripe from 'stripe';
import constants from '../../constants';
import { BaseService } from '../services/base.service';
import { PaymentsRepository } from '../db/repositories/payments.repository';
import { PaymentSystems } from '../../models/payment.entity';
import { Repositories } from '../db/repositories';
import { AccountNumberFacade, CompanyFacade, DidFacade } from '../facade';
import moment = require('moment');
const util = require('util');

@Injectable()
export class PaymentsService extends BaseService {
  stripe: Stripe;
  constructor(
    @Inject('Repositories')
    private readonly Repositories: Repositories,
    @Inject('PaymentsRepository')
    private readonly paymentsRepository: PaymentsRepository,
    private readonly companyFacade: CompanyFacade,
    private readonly didFacade: DidFacade,
    private readonly accountNumberFacade: AccountNumberFacade,
  ) {
    super();
    this.stripe = new Stripe(constants.STRIPE_SECRET!, {
      apiVersion: '2020-08-27',
      typescript: true,
    });
  }

  public async createPayment(data) {
    try {
      const {
        paymentType,
        amount,
        numberQuantity,
        tnArray,
        durationUnit,
        duration,
        userUuid,
        userEmail,
      } = data;
      let payment;
      //  await this.getDurationFromAmount(data.amount, data.planID, data.is_month, data.duration);
      if (paymentType === PaymentSystems.PAYPAL) {
        const { items, total_amount } = await this.prepareDataPaypal(
          amount,
          numberQuantity,
          duration,
        );
        payment = await this.createPaypalPayment({ total_amount, items });
      } else if (paymentType === PaymentSystems.STRIPE) {
        const items = await this.prepareDataStripe({
          amount,
          numberQuantity,
          tnArray,
          durationUnit,
          duration,
        });
        payment = await this.createStripePayment({
          items,
          userUuid,
          userEmail,
        });
      }
      return payment;
    } catch (err) {
      return { error: err.message, status: err.status };
    }
  }

  private async prepareDataStripe({
    amount,
    numberQuantity,
    tnArray,
    durationUnit,
    duration,
  }) {
    const items = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Did numbers ${tnArray.map((tn) => tn.tn)}.\n
				       For ${duration} ${durationUnit}`,
          },
          unit_amount: amount * 100,
        },
        quantity: numberQuantity,
        description: 'Buy did numbers from Fonio',
      },
    ];
    console.log(
      util.inspect(items, { showHidden: false, depth: null, colors: true }),
    );

    return items;
  }

  @Transactional()
  private async createStripePayment({ items, userUuid, userEmail }) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      client_reference_id: userUuid,
      customer_email: userEmail,
      success_url: constants.PAYMENT_SUCCESS_URL,
      cancel_url: constants.PAYMENT_CANCEL_URL,
    });
    return session;
  }

  private async createPaypalPayment({ total_amount, items }) {
    const response = await axios.post(
      constants.PAYPAL_API + '/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              value: total_amount,
              currency_code: 'USD',
            },
          },
        ],
        order_application_context: {
          return_url: constants.PAYMENT_SUCCESS_URL,
          cancel_url: constants.PAYMENT_CANCEL_URL,
        },
      },
      {
        auth: {
          username: constants.PAYPAL_CLIENT,
          password: constants.PAYPAL_SECRET,
        },
      },
    );
    return response.data.id;
  }

  public async executePayment({ body, sig = undefined, type }) {
    let payment;
    let transactionId;

    if (type === PaymentSystems.PAYPAL) {
      payment = await this.executePaypalPayment({ body, sig });
      transactionId = body.orderID;
    } else if (type === PaymentSystems.STRIPE) {
      const paymentResponse = await this.executeStripePayment({
        body,
        sig,
      });
      return paymentResponse;
    }
  }

  private async executeStripePayment({ body, sig }) {
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        sig,
        constants.STRIPE_WEBHOOK_SECRET!,
      );
      if (event.type === 'checkout.session.completed') {
        console.log(' \x1b[41m ', event, ' [0m ');
        const fullfillOrder = await this.paymentSucceed(event.data.object);
        return { success: fullfillOrder, id: event.data.object.id };
      } else {
        return { success: false };
      }
    } catch (err) {
      return { error: err.message, status: err.status };
    }
  }

  private async executePaypalPayment({ body, sig }) {
    try {
      const orderID = body.orderId;

      const response = await axios.post(
        constants.PAYPAL_API + `/v2/checkout/orders/${orderID}/capture`,
        {},
        {
          auth: {
            username: constants.PAYPAL_CLIENT,
            password: constants.PAYPAL_SECRET,
          },
        },
      );

      if (response.data.body?.name === 'VALIDATION_ERROR') {
        console.error(response.data.body.details);
        return { success: false };
      } else if (response.data.status === 'COMPLETED') {
        return { success: true };
      } else {
        return { success: false };
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  @Transactional()
  private async paymentSucceed({ id }) {
    try {
      const updatedPayment = await this.updateEntity(
        this.Repositories.PAYMENTS,
        { transactionId: id },
        { success: true },
      );

      const { userId, companyId, planId, duration, durationUnit } =
        updatedPayment;
      const didNumbers = updatedPayment.didNumbers?.map(
        (num) => JSON.parse(num).tn,
      );
      const company = await this.companyFacade.getCompanyById(companyId);

      const purchasedNumbers = await this.accountNumberFacade.addDidNumbers(
        userId,
        companyId,
        true,
        didNumbers,
        company,
        planId,
      );

      if (purchasedNumbers?.error) {
        return false;
      }

      const months = durationUnit === 'year' ? duration * 12 : duration;
      await this.updateDidExpiration(didNumbers, months);

      if (purchasedNumbers) {
        return true;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  private async updateDidExpiration(didNumbers, months) {
    let expiration = moment(Date.now()).add(months, 'M').toISOString();
    let expireOn = new Date(expiration);

    await this.didFacade.updateExpirationByNumbers(didNumbers, expireOn);
  }

  //  @Transactional()
  //  public async createUser(register) {
  //    try {
  //      const user: any = await this.authService.signUp(register);
  //      if (user.error) {
  //        return { user: { error: user.error } };
  //      }
  //      if (!user) await HelperClass.throwErrorHelper('auth:BadRequest');
  //      //TODO check unique login fro sipUser
  //      const login = `${register.firstName}_${register.lastName}_${Date.now()}`;
  //      const sipUser = await this.opentactService.createSipUser({
  //        login,
  //        password: register.password,
  //      });
  //      if (user.user) {
  //        const updatedUser = await this.updateEntity(
  //          this.Repositories.USERS,
  //          { id: user.user.id },
  //          { sipUsername: login },
  //        );
  //      }
  //      if (user.company && user.user) {
  //        const createdTokens = await this.companyFacade.saveToken(
  //          login,
  //          register.password,
  //          user.user,
  //        );
  //      }
  //      return { user };
  //    } catch (e) {
  //      return { user: { error: e.message } };
  //    }
  //  }

  private async getDurationFromAmount(amount, planID, is_month, duration) {
    console.log(' \x1b[41m ', arguments, ' [0m ');
    if (!duration) {
      throw new Error('Please provide duration greater than 0');
    }
    if (!planID) {
      throw new Error('Missing plan id');
    }
    const plan = await this.getEntity(this.Repositories.PLAN, {
      id: planID,
      status: true,
    });
    if (!plan) {
      throw new Error('No such plan');
    }
    console.log(' \x1b[41m ', plan, ' [0m ');
    let defDuration;
    console.log(
      ' \x1b[41m ',
      +amount,
      plan.annuallyAmount,
      plan.monthlyAmount,
      ' [0m ',
    );
    switch (+amount) {
      case plan.annuallyAmount:
        defDuration = 12;
        break;
      case plan.monthlyAmount:
        defDuration = 1;
        break;
      default:
        throw new Error('Incorrect amount');
    }

    if ((defDuration === 12 && is_month) || (defDuration === 1 && !is_month)) {
      throw new Error('Incorrect amount');
    }

    return defDuration;
  }

  public async storePaymentData(paymentId, data) {
    const paymentBody = {
      transactionId: paymentId,
      payWith: data.paymentType,
      userId: data.userId,
      companyId: data.companyId,
      amount: data.amount,
      unitAmount: data.amount / data.numbers.length,
      durationUnit: data.durationUnit,
      duration: data.duration,
      didNumbers: data.numbers,
      planId: data.planID,
    };
    return await this.paymentsRepository.create(paymentBody);
  }

  private async prepareDataPaypal(amount, numberQuantity, duration) {
    const items = [
      {
        name: 'top up',
        currency: 'USD',
        description: 'top up your balance',
        quantity: numberQuantity,
        unit_amount: amount,
        duration,
      },
    ];
    const total_amount = amount * numberQuantity * duration;

    return { total_amount, items };
  }

  public async approvalUrl(service, orderID) {
    if (service === 'paypal') {
      const response = await axios.get(
        constants.PAYPAL_API + `/v2/checkout/orders/${orderID}`,
        {
          auth: {
            username: constants.PAYPAL_CLIENT,
            password: constants.PAYPAL_SECRET,
          },
        },
      );

      return response.data.links.find((link) => link.rel === 'approve');
    } else if (service === 'stripe') {
      const session = await this.stripe.checkout.sessions.retrieve(orderID);

      return session;
    }
  }
}
