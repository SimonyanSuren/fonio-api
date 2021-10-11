import { CallFlowStep, Account, User, CallFlow, Did } from "../../models";
import { Injectable } from '@nestjs/common';
import { EntityRepository, EntityManager } from "typeorm";
import { CallFlowReq } from "../../util/swagger/call_flow_req";
import { MessageCodeError } from '../../util/error';
import { Constants } from '../../util/constants';
import { v4 } from 'uuid';
import { RecordingFacade } from "./recording.facade";
import { OpentactService } from "../opentact";
import { TagFacade } from "./tag.facade";
import * as fs from 'fs';
import { Config } from "../../util/config";
import { AccountNumberFacade } from "./accountnumber.facade"
import CallFlowProcessor from "./call_flow"

@EntityRepository()
@Injectable()
export class CallFlowFacade {

    constructor(private entityManager: EntityManager,
        private recordingFacade: RecordingFacade,
        private tagFacade: TagFacade,
        private opentactService: OpentactService,
        private accountNumberFacade: AccountNumberFacade) {
    }



    async findById(accountId: number, caflId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(CallFlow, "cf")
            .where("account.id = :accountId ")
            .where("cf.id = :caflId ")
            .leftJoinAndSelect("cf.account", "account")
            .setParameters({ accountId, caflId })
            .getOne();
    }

    async findByName(accountId: number, caflName: string) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(CallFlow, "cf")
            .leftJoinAndSelect("cf.account", "account")
            .where("account.acco_id = :accountId ")
            .andWhere("lower(cf.name) = lower(:caflName) ")
            .setParameters({ accountId, caflName: caflName.trim() })
            .getOne();
    }

    async persistSteps(steps: Array<CallFlowStep>, tEM: EntityManager, user: User, account: Account, callFlow: CallFlow, currentUser, callFlowBody) {
        if (!steps) {
            return;
        }

        try {
            const stepsProcessor = new CallFlowProcessor(steps, callFlow, user, currentUser, tEM, this.recordingFacade, this.opentactService, this.tagFacade);
            await stepsProcessor.save();
            let xmls = await stepsProcessor.prepareXML();
            for (let flow in xmls) {
                if(!isNaN(+flow)){
                    const entity = await tEM.update(CallFlow, { id: flow }, { xml: xmls[flow], status: true });
                    if (callFlowBody.didId) {
                        const entityDid = await tEM.update(Did, { id: callFlowBody.didId, userID: user.id }, { cfId: +flow });
                    }
                }
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async create(currentUser, callFlowBody: CallFlowReq, apdiId, acnuId) {
        if (!callFlowBody || !callFlowBody.name) {
            throw new MessageCodeError('name:NotFound');
        }
        if (!callFlowBody.hasOwnProperty('record')) {
            callFlowBody["record"] = false;
        }
        let nameFound = await this.findByName(currentUser.accountId, callFlowBody.name);
        if (nameFound) {
            throw new MessageCodeError("name:AlreadyExists");
        }
        console.log("CREATE CALL FLOW", callFlowBody);
        let manager = await this.entityManager;
        let callFlow = new CallFlow();
        await manager.transaction(async tEM => {
            // let callFlow = new CallFlow();
            let account = new Account();
            account.id = currentUser.accountId;
            callFlow.account = account;

            let user = new User();
            user.id = currentUser.userId;
            callFlow.user = user;

            callFlow.name = callFlowBody.name;
            callFlow.record = callFlowBody.record;
            callFlow.metadata = callFlowBody;
            callFlow = await tEM.save(callFlow);
            if (!callFlowBody.steps || !Array.isArray(callFlowBody.steps) || callFlowBody.steps.length < 1) {
                return callFlow;
            }
            for (let index in callFlowBody.steps) {
                let step = callFlowBody.steps[index];
                if (!step.type || !step.type.id) {
                    continue;
                }
                if (!step.order) {
                    step.order = parseInt(index);
                }
                step.uniqueId = v4();
            }
            try {
                await this.persistSteps(callFlowBody.steps, tEM, user, account, callFlow, currentUser, callFlowBody);
            }
            catch (error) {
                console.log("error: ", error);
                throw new MessageCodeError(error.messageCode);
            }
        });
        try {
            if (acnuId)
                await this.accountNumberFacade.assignCallFlow(currentUser, acnuId, callFlow.id);
        }
        catch (error) {
            console.log("error: ", error.messageCode);
            throw new MessageCodeError(error.messageCode);
        }
        return callFlow;
    }

    async isCallFlowWithTheSameNameAlreadyExist(userId, accountId, callFlowName) {
        return this.entityManager.createQueryBuilder(CallFlow, 'cf')
            .where('cf.userID=:userID', { userID: userId })
            .andWhere('cf.accountID=:accountID', { accountID: accountId })
            .andWhere('cf.callFlowName=:callFlowName', { callFlowName: callFlowName })
            .getOne();
    }
    async findAllAccount(accountId: number, filter: string, orderBy = 'creation', orderType = 'descending', offset = 0, limit = 10, isAll = false, didId?) {
        let manager = await this.entityManager;
        let query = manager.createQueryBuilder(CallFlow, "cf")
            .addSelect("(SELECT count(*) FROM did where cf_id=cf.cafl_id)", "countnumbers")
            .where("account.id = :accountId ", { accountId: accountId })
            .leftJoinAndSelect("cf.account", "account")
        if (didId) {
            query.innerJoinAndSelect(Did, "did", `cf.cafl_id=did.cf_id and did.id=${didId}`)
        } else {
            query.leftJoinAndSelect(Did, "did", "cf.cafl_id=did.cf_id");
        }
        if (filter) {
            query.andWhere(`cf.name like '%${filter}%'`);
        }

        if (!orderType || "ascending" === orderType) {
            if (orderBy == 'countnumbers')
                query.orderBy(`${orderBy}`, "ASC");
            else
                query.orderBy(`cf.${orderBy}`, "ASC");
        } else if (!orderType || "descending" === orderType) {
            if (orderBy == 'countnumbers')
                query.orderBy(`${orderBy}`, "DESC");
            else
                query.orderBy(`cf.${orderBy}`, "DESC");
        }

        if (!isAll) {
            query.offset(offset);
            query.limit(limit);
        }

        let result = await query.getRawMany();
        let total = await query.getCount();
        let new_result = new Array();
        for (const item of result) {
            let temp = {
                id: null,
                name: null,
                countnumbers: null,
                status: null,
                creation: null,
                metadata: null,
                record: null,
                account: {
                    allowOutbound: null,
                    creation: null,
                    dnlId: null,
                    id: null,
                    metadata: null,
                    name: null,
                    number: null,
                    planUuid: null,
                    status: null,
                    techPrefix: null
                },
                did: {
                    didNumber: null,
                    didId: null,
                },
            };
            temp.id = item.cf_cafl_id;
            temp.name = item.cf_cafl_name;
            temp.countnumbers = item.countnumbers;
            temp.status = item.cf_cafl_status;
            temp.creation = item.cf_cafl_creation;
            temp.metadata = item.cf_cafl_json;
            temp.record = item.cf_cafl_record;
            temp.account.allowOutbound = item.account_acco_allow_outbound;
            temp.account.creation = item.account_acco_creation;
            temp.account.dnlId = item.account_acco_dnl_id;
            temp.account.id = item.account_acco_id;
            temp.account.metadata = item.account_acco_json;
            temp.account.name = item.account_acco_name;
            temp.account.number = item.account_acco_number;
            temp.account.planUuid = item.account_plan_uuid;
            temp.account.status = item.account_acco_status;
            temp.account.techPrefix = item.account_acco_tech_prefix;
            temp.did.didId = item.did_did_id;
            temp.did.didNumber = item.did_did_number;
            new_result.push(temp);
        }
        return [new_result, total];
    }

    async delete(currentUser, callFlowId) {
        if (!callFlowId) {
            throw new MessageCodeError('id:NotFound');
        }
        let callFlow = await this.findById(currentUser.accountId, callFlowId);
        if (!callFlow) {
            throw new MessageCodeError("id:invalid");
        }
        let manager = await this.entityManager;

        return await manager.transaction(async tEM => {
            if (!callFlow) {
                return;
            }
            await tEM.query("delete from call_flow_steps where cafl_id = $1", [callFlow.id]);
            await tEM.query("delete from call_flow where cafl_id = $1", [callFlow.id]);
        });
    }


    public async changeStatus(currentUser, caflId: number, status: any) {
        let manager = await this.entityManager;
        let callFlow = await this.findById(currentUser.accountId, caflId);
        return await manager.transaction(async tEM => {
            if (!callFlow) {
                throw new MessageCodeError('callFlow:NotFound');
            }
            callFlow.status = status.status;
            return await tEM.save(callFlow);
        })
    }

    async edit(currentUser, caflId: number, callFlowBody: CallFlowReq) {
        if (!caflId) {
            throw new MessageCodeError('id:NotFound');
        }
        if (!callFlowBody || !callFlowBody.name) {
            throw new MessageCodeError('name:NotFound');
        }
        if (!callFlowBody.hasOwnProperty('record')) {
            callFlowBody["record"] = false;
        }

        console.log("CREATE CALL FLOW", callFlowBody);
        let manager = await this.entityManager;
        let callFlow = await this.findById(currentUser.accountId, caflId);

        return await manager.transaction(async tEM => {
            if (!callFlow) {
                throw new MessageCodeError('callFlow:NotFound');
            }
            callFlow.name = callFlowBody.name;
            callFlow.record = !!callFlowBody.record;
            await tEM.save(callFlow);
            if (!callFlowBody.steps || !Array.isArray(callFlowBody.steps) || callFlowBody.steps.length < 1) {
                return callFlow;
            }
            let user = callFlow.user;
            if (!user) {
                user = new User();
                user.id = currentUser.userId;
                callFlow.user = user;
            }
            await tEM.query("delete from call_flow_steps where cafl_id = $1", [callFlow.id]);
            for (let index in callFlowBody.steps) {
                let step = callFlowBody.steps[index];
                if (!step.type || !step.type.id) {
                    continue;
                }
                if (!step.order) {
                    step.order = parseInt(index);
                }
                step.uniqueId = v4();
            }

            await this.persistSteps(callFlowBody.steps, tEM, user, callFlow.account, callFlow, currentUser, callFlowBody);
            return callFlow;
        });
    }

    async getMenuStepXml(callFlowId: number, cfsId: number, digits: number) {
        let xmlPath = (process.env.NODE_ENV === 'development'
            ? Config.string("DEV_PATH_TO_GREETING_XML", "/var/www/xmls")
            : Config.string("PROD_PATH_TO_GREETING_XML", "/var/www/xmls")
        ) + '/' + [callFlowId, cfsId, digits].join('-') + ".xml";

        return fs.readFileSync(xmlPath, 'utf8')
    }

    async sendOpentactCallXml(call_uuid, number) {
        let xml: string = `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
            <Hangup/>
        </Response>`;

        let did = await this.entityManager.createQueryBuilder(Did, 'did')
            .leftJoinAndSelect('did.callFlow', 'callFlow')
            .where('did.did_number=:number', { number: number })
            .getOne();

        return await this.opentactService.executeCallSCA(call_uuid, did?.callFlow.xml||xml);
    }
}