'use strict';

import { Module, RequestMethod } from '@nestjs/common';
import { MiddlewareConsumer } from "@nestjs/common";
import { AuthMiddleware } from "../../filters/auth.middleware";


import { AuthController } from './auth.controller';
import { CompanyController } from './company.controller';
// import { UploadGreetingController } from './greeting_patch_upload';
// import { AccountController } from './account.controller';
// import { GreetingController } from "./greeting.controller";
import { CallFlowController } from './call_flow.controller';
// import { PlanController } from './plan.controller';
// import { HangupController } from "./hangup.controller";
import { BlackListController } from './blacklist.controller';
// import { CreditCardController } from './credit_card.controller';
// import { SimulcallController } from "./simulcall";
import { DidController } from './did.controller';
// import { DialsController } from "./dials";
import { UploadUserImage } from './upload';
import { PublicApi } from './public';
// import { AreaCodeController } from './area_code.controller';
import { AuthModule } from '../auth';
// import { MenuController } from "./menu.flow.controller";
import { FacadeModule } from '../facade';
import { OpentactModule } from '../opentact';
import { PaymentsService } from '../payments';
import { EmailModule } from '../email';
import { AdminApi } from "./admin-api";
import { TrackingNumberController } from './tracking.number.controller';
import { DeleteUserImage } from "./delete";
// import { KeywordsController } from "./keywords.controller";
// import { StatisticsController } from "./statistics.controller";
import { UserController } from "./user.controller";
// import { CallScoreController } from './call_score.controller';
// import { NotificationController } from './notification.controller';
// import { TypesController } from './types.controller';
// import { CallScribeController } from './call_scribe.controller';
// import { OpentactController } from './opentact.controller';
// import { LeadController } from './lead.controller';
// import { TagController } from './tag.controller';
import { ContactController } from './contact.controller';
// import { TtsController } from './tts.controller';
// import { SmsController } from './sms.controller';
import { CallerDetailsController } from './caller_details.controller';
import { PaymentsController } from './payments.controller'
import { DBFactoryModule } from '../db';
import { CommonService } from '../services/common.service';
import { PermissionsService } from '../services/permissions.service';
import { Repositories} from '../db/repositories';
// import { LogController } from './log.controller';
import { VoiceMail } from './voicemail';


@Module({
    controllers: [
        AuthController,
        // OpentactController,
        // AccountController,
        TrackingNumberController,
        PaymentsController,
        // AreaCodeController,
        // HangupController,
        // MenuController,
        // GreetingController,
        // UploadGreetingController,
        CallFlowController,
        BlackListController,
        // DialsController,
        CompanyController,
        // SimulcallController,
        // CreditCardController,
        // StatisticsController,
        UploadUserImage,
        DeleteUserImage,
        DidController,
        // PlanController,
        PublicApi,
        AdminApi,
        // KeywordsController,
        UserController,
        // CallScoreController,
        // CallScribeController,
        // NotificationController,
        // TypesController,
        // OpentactController,
        // LeadController,
        // TagController,
        ContactController,
        // TtsController,
        // SmsController,
        CallerDetailsController,
        // LogController,
        VoiceMail
    ],
    imports: [
        AuthModule, FacadeModule, EmailModule, OpentactModule, DBFactoryModule
    ],
    providers: [
        PaymentsService, CommonService, PermissionsService, Repositories
    ],
    exports: []
})
export class RestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).forRoutes(
            { path: '/**', method: RequestMethod.ALL },
        );
    }
}
