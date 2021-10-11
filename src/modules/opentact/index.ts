
import { Module } from '@nestjs/common';
import { DBFactoryModule } from '../db';
import { WSGateway } from '../websocket/sms.gateway';
import {CallFlowService} from '../services/callFlow.service';
import { Repositories} from '../db/repositories';
import { OpentactAuth } from './opentact.auth';
import { OpentactService } from './opentact.service';

@Module({
    imports: [DBFactoryModule],
    providers: [OpentactService, OpentactAuth, WSGateway, CallFlowService, Repositories ],
    exports: [OpentactService, OpentactAuth]
})

export class OpentactModule {
}
export {components} from './opentact-original.dto';
export { OpentactAuth } from './opentact.auth';
export { OpentactService } from './opentact.service';
export { opentactCreateSipUserDto, opentactISIPControlAppCallSearchParams,opentactITNLeaseSearchParams, opentactIOutboundVoiceProfileUpdateParams, opentactIOutboundVoiceProfileNewParams, opentactISIPDomainUpdateParams, opentactISIPControlAppUpdateParams, opentactISIPControlAppNewParams, opentactITNLeasesAssignParams, opentactISMSISMSSearchParams, opentactESearchMode, opentactISMSISearchParams, opentactIMessagingProfile, opentactISMSNewParams, opentactISIPUserResponse, opentactITNOrderNewParams, opentactITNSearchParams, opentactITNSearchResponse } from './opentact.dto';
