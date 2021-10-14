import { PaymentSystems } from "../../models/payment.entity";
import { CreatePaymentReq } from "../../util/swagger";
import { OrderDid } from "../../util/swagger/order_did";



export abstract class CreatePayment {
    amount?: number;
    type: PaymentSystems;
    // planId?: number;
    register: CreatePaymentReq;
};

export abstract class BuyDidNumbers {
    amount?: number;
    type: PaymentSystems;
    additionalNumbers?: OrderDid[];
};