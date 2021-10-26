import { ApiProperty } from '@nestjs/swagger';

export class ChangePassword {
    @ApiProperty()
    key: string;
    @ApiProperty()
    password: string;
}
