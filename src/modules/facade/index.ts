import {Module} from '@nestjs/common';

// import {CreditCardFacade} from './creditcard.facade';
import {AccountNumberFacade} from './accountnumber.facade';
import {UserFacade} from './user.facade';
// import {GreetingFacade} from "./greeting.facade";
import {CompanyFacade} from './company.facade';
// import {AccountFacade} from './account.facade';
import {AdminFacade} from "./admin.facade";
import {PlanFacade} from './plan.facade';
// import {HangupFacade} from "./hangup";
import {BlackListFacade} from './blacklist.facade';
import {DidFacade} from './did.facade';
import {CallFlowFacade} from "./call_flow.facade";
// import {DialsFacade} from "./dials.facade";
// import {SimulcallFacade} from "./simulcall.facade";
// import {MenuFacade} from "./menu";
// import {KeywordsFacade} from "./keywords.facade";
// import {StatisticsFacade} from "./statistics.facade";
import {DBFactoryModule} from '../db';
import {EmailModule} from '../email';
import {OpentactModule} from '../opentact';
// import {CallTranslateFacade} from './call_translate.facade';
import {TagFacade} from './tag.facade';
// import {CallNotificationFacade} from './callnotification.facade';
// import {CompanySummaryFacade} from './companysummary.facade';
import {DataFacade} from './data.facade';
import {RecordingFacade} from './recording.facade';
import {CallFlowStepFacade} from './callflowstep.facade';
import {ContactFacade} from './contact.facade';
import {InvoiceFacade} from './invoice.facade';
import {PaymentFacade} from './payment.facade';
// import {SmsFacade} from './sms.facade';
import {CallerDetailsFacade} from './caller_details.facade';
import {Repositories} from '../db/repositories';
import {LogFacade} from './log.facade';
import {LogConsumer} from '../queues';
import {BullModule} from '@nestjs/bull';

const FACADES = [
    UserFacade, CompanyFacade,
    CallFlowFacade, BlackListFacade, PlanFacade,
    // AccountFacade, CreditCardFacade, GreetingFacade,
    AdminFacade, //DialsFacade, SimulcallFacade,
    DidFacade, //HangupFacade, MenuFacade,
    AccountNumberFacade, //KeywordsFacade,
    // StatisticsFacade, CallTranslateFacade, 
    TagFacade,
    // CallNotificationFacade, CompanySummaryFacade,
    RecordingFacade, CallFlowStepFacade, DataFacade, ContactFacade,
    InvoiceFacade, PaymentFacade, CallerDetailsFacade, //SmsFacade, 
    LogFacade, LogConsumer
];

@Module({
    providers: [...FACADES, Repositories],
    exports: [...FACADES],
    imports: [
        DBFactoryModule, 
        EmailModule, 
        OpentactModule, 
        BullModule.registerQueue({
            name: 'log',
        })
    ]
})

export class FacadeModule {
    
}

export {UserFacade} from './user.facade';
export {CompanyFacade} from './company.facade';
// export {AccountFacade} from './account.facade';
export {AdminFacade} from './admin.facade';
export {PlanFacade} from './plan.facade';
export {BlackListFacade} from './blacklist.facade';
// export {CreditCardFacade} from './creditcard.facade';
export {AccountNumberFacade} from './accountnumber.facade';
export {DidFacade} from './did.facade';
export {CallFlowFacade} from './call_flow.facade';
// export {GreetingFacade} from "./greeting.facade";
// export {DialsFacade} from './dials.facade';
// export {SimulcallFacade} from './simulcall.facade';
// export {HangupFacade} from './hangup';
// export {MenuFacade} from './menu';
// export {KeywordsFacade} from './keywords.facade';
// export {StatisticsFacade} from './statistics.facade';
// export {CallTranslateFacade} from './call_translate.facade';
export {TagFacade} from './tag.facade';
// export {CallNotificationFacade} from './callnotification.facade'
// export {CompanySummaryFacade} from './companysummary.facade'
export {DataFacade} from './data.facade';
export {RecordingFacade} from './recording.facade';
export {CallFlowStepFacade} from './callflowstep.facade';
export {ContactFacade} from './contact.facade';
export {InvoiceFacade} from './invoice.facade';
export {PaymentFacade} from './payment.facade';
// export {SmsFacade} from './sms.facade';
export {CallerDetailsFacade} from './caller_details.facade';
export {LogFacade} from './log.facade';
export {LogConsumer} from '../queues';