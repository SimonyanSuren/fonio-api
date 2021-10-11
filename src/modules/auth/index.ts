'use strict';

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FacadeModule } from '../facade';
import { OpentactModule } from '../opentact';
import { DBFactoryModule } from '../db';

@Module({
    providers: [AuthService ],
    imports: [FacadeModule, OpentactModule, DBFactoryModule],
    exports: [AuthService]
})
export class AuthModule { }

export { AuthService } from './auth.service';
