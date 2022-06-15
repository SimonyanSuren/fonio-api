import { ApiProperty } from "@nestjs/swagger";


export class OrderDid {
    @ApiProperty()
    tn: number;
    @ApiProperty()
    features: string[];
    @ApiProperty()
    autorenew: boolean;
}

export class OrderDids {
    @ApiProperty({
        type: [OrderDid],
      })
    numbers: OrderDid[];
}

