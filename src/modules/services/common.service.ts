import { Injectable, Inject } from '@nestjs/common';
import { BaseService} from './base.service'
import { OpentactService, opentactESearchMode, components } from '../opentact';
import { Repositories } from '../db/repositories';
import * as dayjs from "dayjs";

@Injectable()
export class CommonService extends BaseService {

    constructor(
        @Inject('Repositories')
        private readonly Repositories: Repositories,
        @Inject('DidsRepository')
        private opentactService: OpentactService,

    ) {
        super()
    }


    public async sendSms(currentUser, to: string, msg: string, from?: string,) {
        const tn = from || (await this.getEntity(this.Repositories.DID, { companyID: currentUser.companyId })).number
        return await this.opentactService.createSMS({
            to,
            tn: +tn,
            message: msg
        });

    }

    public async getIncommingSms(currentUser, limit, offset) {
        let where: any = { companyID: currentUser.companyId }

        const tnResponse = (await this.getEntities(this.Repositories.DID, where))
        if (tnResponse?.items) {
            let promiseArray: any = []
            let draftResults: any = []
            let response
            for (let i = 0; i < tnResponse.items.length; i++) {
                const tn = tnResponse.items[i].number
                const take = limit;
                const skip = offset;
                const tnResult = this.opentactService.searchSMS({
                    take,
                    skip,
                    to: tn,
                });
                promiseArray.push(tnResult);
            }
            const resolvedPromises: components["schemas"]["ISMSISMSSearchResponse"][] = await Promise.all(promiseArray)
            resolvedPromises.forEach(el => {
                if (!response) {
                    response = el
                }
                draftResults.push(...el.payload?.data);
            })
            response.payload.data = draftResults
            return response;
        } else {
            throw new Error('404')
        }
    }

    public async getAllSms(currentUser, limit, offset, startDate, endDate, direction, number) {
        let where: any = { companyID: currentUser.companyId }

        if (!!number) {
            where.number = number
        }
        const tnResponse = (await this.getEntities(this.Repositories.DID, where))

        if (tnResponse?.items) {
            const take = limit;
            const skip = offset;
            const created_on_from = dayjs(startDate).startOf("date").toISOString()
            const created_on_to = dayjs(endDate).endOf("date").toISOString()
            let to
            let from
            let promiseArray: any = []
            let draftResults: any = []
            let response
            for (let i = 0; i < tnResponse.items.length; i++) {
                const tn = tnResponse.items[i].number
                switch (direction) {
                    case "inbound": to = tn
                        break;
                    case "outbound": from = tn
                        break;
                    default: from = tn
                        to = tn
                }
                const tnResult = this.opentactService.searchSMS({
                    take,
                    skip,
                    mode: opentactESearchMode.OR,
                    created_on_from,
                    created_on_to,
                    to,
                    from,
                });
                promiseArray.push(tnResult);
            }
            const resolvedPromises: components["schemas"]["ISMSISMSSearchResponse"][] = await Promise.all(promiseArray)
            resolvedPromises.forEach(el => {
                if (!response) {
                    response = el
                }
                draftResults.push(...el.payload?.data);
            })
            if(response) {
                return  response.payload.data = draftResults
            }
           return response = {
               message:"You dont have any sms yet"
           }

        } else {
            throw new Error('404')
        }
    }


    public async getAllLogs(currentUser, startDate = dayjs().startOf("date").toISOString(), endDate = dayjs().startOf("date").toISOString()) {
        const logs = await this.opentactService.getSipAppCalls({});
        let where: any = { companyID: currentUser.companyId }
        const tnResponse = (await this.getEntities(this.Repositories.DID, where))
        const numbers = tnResponse.items.map(item => item.number)

        const convertedLogs = logs.payload.map((log: any) => {
            const isIncoming = numbers.indexOf(log.tn?.tn?.toString())
            if (isIncoming !== -1) {
                log.numberName = tnResponse.items[isIncoming]?.numberName
                log.type = 'inbound'
            } else if (numbers.indexOf(log.from?.toString()) !== -1) {
                log.type = 'outbound'
            } else {
                return
            }
            const newEl = {
                from: log.from,
                to: log.tn.tn,
                createdOn: log.created_on,
                type: log.type,
                numberName: log.numberName,
            }
            return newEl

        })
    }

}