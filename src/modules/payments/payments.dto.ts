import { ApiProperty } from "@nestjs/swagger";
import { PaymentSystems } from "../../models/payment.entity";
import { PlanNumberTypes } from "../../models/plan.constant.entity";
import { CreatePaymentReq } from "../../util/swagger";
import { OrderDid } from "../../util/swagger/order_did";

export abstract class CreatePayment {
    @ApiProperty()
    amount?: number;
    @ApiProperty()
    paymentType: PaymentSystems;
    // planId?: number;
    @ApiProperty()
    orderUuid: string;
    @ApiProperty()
    tempUuid: string;
    @ApiProperty()
    register: CreatePaymentReq;
    @ApiProperty()
    numberType: PlanNumberTypes;
};

export abstract class BuyDidNumbers {
    @ApiProperty() 
    amount?: number;
    @ApiProperty() 
    paymentType: PaymentSystems;
    @ApiProperty()
    orderUuid: string;
    @ApiProperty()
    additionalNumbers?: OrderDid[];
    @ApiProperty()
    numberType: PlanNumberTypes;
};