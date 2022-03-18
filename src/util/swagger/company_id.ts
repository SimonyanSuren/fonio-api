import {ApiProperty} from '@nestjs/swagger';
import { ValidateNested, IsArray } from "class-validator";

export class CompanyId {
    @ApiProperty()
    compId: number;
}

export class CompanyPost {
    @ApiProperty()
    companyName: string;
    @ApiProperty()
    status: boolean;
    @ApiProperty()
    balance: number;
    @ApiProperty()
    zone: string;
    @ApiProperty()
    userID: string;
}

export class CompanyUsers {
    @IsArray()
    @ApiProperty({ isArray: true })
    uuids: string;
}

export class CompanyStatus {
    @ApiProperty()
    remove_number_notification: boolean;

    @ApiProperty()
    add_number_notification: boolean;
}

export class CompanyUpdate {
    @ApiProperty()
    name: string;
}

export class CompanyInfo {
    @ApiProperty()    
    id: number;

    @ApiProperty()
    name: string;    

    @ApiProperty()
    userCreatorID: number;

    @ApiProperty()
    uuid: string;

    @ApiProperty()
    status: boolean;

    @ApiProperty()
    balance: number;    

    @ApiProperty()
    identityUuid: string;

    @ApiProperty()
    userUuid: string;
    
    @ApiProperty()
    timezone: string;

    @IsArray()
    @ApiProperty({ isArray: true })
    uuids: string;
}

export class CompanySelfInfo {
    @ApiProperty()
    name: string;

    @ApiProperty()
    timezone: string;

    @IsArray()
    @ApiProperty({ isArray: true })
    uuids: string;
}
