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
    @ApiProperty()
    orderUuid: string;
    @ApiProperty()
    tempUuid: string;
    @ApiProperty()
    register: CreatePaymentReq;
    @ApiProperty()
    numberType: PlanNumberTypes;
    @ApiProperty()
    planID: number;
    @ApiProperty()
    duration: number;
    @ApiProperty()
    is_month: boolean;
};

export abstract class BuyDidNumbers {
    @ApiProperty() 
    amount?: number;
    @ApiProperty() 
    paymentType: PaymentSystems;
    @ApiProperty()
    orderUuid: string;
    @ApiProperty({
        type: [OrderDid],
      })
    additionalNumbers?: OrderDid[];
    @ApiProperty()
    numberType: PlanNumberTypes;
    @ApiProperty()
    planID: number;
    @ApiProperty()
    duration: number;
    @ApiProperty()
    is_month: boolean;
};