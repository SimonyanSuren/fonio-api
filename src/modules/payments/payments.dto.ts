import { ApiProperty } from "@nestjs/swagger";
import { PaymentSystems } from "../../models/payment.entity";
import { CreatePaymentReq } from "../../util/swagger";
import { OrderDid } from "../../util/swagger/order_did";



export abstract class CreatePayment {
    @ApiProperty()
    amount?: number;
    @ApiProperty()
    type: PaymentSystems;
    // planId?: number;
    @ApiProperty()
    orderUuid: string;
    @ApiProperty()
    tempUuid: string;
    @ApiProperty()
    register: CreatePaymentReq;
};

export abstract class BuyDidNumbers {
    @ApiProperty() 
    amount?: number;
    @ApiProperty() 
    type: PaymentSystems;
    @ApiProperty()
    orderUuid: string;
    @ApiProperty()
    additionalNumbers?: OrderDid[];
};