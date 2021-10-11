'use strict';

import {Module} from '@nestjs/common';
import {RestModule} from './restful';
import {AuthModule} from './auth';
import {DBFactoryModule} from './db';
import {FacadeModule} from './facade';
import {EmailModule} from './email';
import {OpentactModule} from './opentact';
import {CronScheduleModule} from './cron_schedule';

import { WSGateway } from './websocket/sms.gateway';
import { Repositories} from './db/repositories';
import { AppGateway } from './websocket/app.geteway';
import { BullModule } from '@nestjs/bull';


@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            }
        }),
        RestModule,
        AuthModule,
        OpentactModule,
        DBFactoryModule,
        FacadeModule,
        EmailModule,
        CronScheduleModule,
    ],
    providers:[WSGateway, Repositories, AppGateway],
    exports: []
})
export class ApplicationModule {
}
