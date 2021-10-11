import { CallFlowStep } from "../../models";
import { Injectable } from '@nestjs/common';

import { EntityRepository, EntityManager} from "typeorm";

@EntityRepository()
@Injectable()
export class CallFlowStepFacade {

    constructor(private entityManager: EntityManager) { }

    async findSteps(callFlowId: number, offsetStep: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(CallFlowStep, "cfs")
            .addSelect("usr.firstName")
            .addSelect("usr.lastName")
            .addSelect("usr.email")
            .addSelect("usr.id")
            .where("callFlow.id = :callFlowId ")
            .andWhere(" cfs.order >= :offsetStep ")
            .leftJoinAndSelect("cfs.callFlow", "callFlow")
            .leftJoin("cfs.user", "usr")
            .leftJoinAndSelect("cfs.type", "type")
            .leftJoinAndSelect("cfs.recording", "recording")
            .setParameters({ callFlowId, offsetStep })
            .orderBy("cfs.order ", "ASC")
            .getMany();
    }
    async findStep(callFlowId: number, currentStep: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(CallFlowStep, "cfs")
            .where("callFlow.id = :callFlowId ")
            .andWhere(" cfs.order = :currentStep ")
            .leftJoinAndSelect("cfs.callFlow", "callFlow")
            .leftJoinAndSelect("cfs.user", "user")
            .leftJoinAndSelect("cfs.type", "type")
            .setParameters({ callFlowId, currentStep })
            .orderBy("cfs.order ", "ASC")
            .getOne();
    }
    async findById(caFsId: number) {
        let manager = await this.entityManager;
        return manager.createQueryBuilder(CallFlowStep, "cfs")
            .where("cfs.id = :caFsId ")
            .andWhere(" cfs.order = :currentStep ")
            .leftJoinAndSelect("cfs.callFlow", "callFlow")
            .leftJoinAndSelect("cfs.user", "user")
            .leftJoinAndSelect("cfs.type", "type")
            .setParameters({ caFsId })
            .orderBy("cfs.order ", "ASC")
            .getOne();
    }



}