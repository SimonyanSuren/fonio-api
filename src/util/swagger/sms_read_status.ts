import { ApiProperty } from "@nestjs/swagger";

export class SmsReadStatus {
    @ApiProperty()
    read: boolean;

    @ApiProperty()
    date: string;
};
