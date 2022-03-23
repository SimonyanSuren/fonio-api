import {ApiProperty} from '@nestjs/swagger';

export class ResetPassword {
    @ApiProperty()
    email: string;
}

export class UpdatePassword {
    @ApiProperty()
    originalPassword: string;

    @ApiProperty()
    newPassword: string;

    @ApiProperty()
    rePassword: string;
}

export class ChangeUserPassword {
    @ApiProperty()
    newPassword: string;

    @ApiProperty()
    rePassword: string;
}
