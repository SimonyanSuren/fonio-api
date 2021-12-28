import { Orders } from "../../models";
import { Injectable } from '@nestjs/common';
import { EntityManager } from "typeorm";

@Injectable()
export class OrderFacade {

    constructor(private entityManager: EntityManager) {}

    public async saveOrder({ uuid, state }, userUuid) {
        const order = new Orders();
        order.orderUuid = uuid;
        order.userUuid = userUuid;
        order.state = state;

        return await order.save();
    }

    public async getUserOrder(orderUuid, userUuid) {
        return await this.entityManager.createQueryBuilder(Orders, 'o')
            .where('o.orderUuid=:orderUuid', { orderUuid })
            .andWhere('o.userUuid=:userUuid', { userUuid })
            .getOne();
    }

    public async orderDone(orderUuid, userUuid) {
        return await this.entityManager.createQueryBuilder()
        .update(Orders)
        .set({ done: true })
        .where('o.orderUuid=:orderUuid', { orderUuid })
        .andWhere('o.userUuid=:userUuid', { userUuid })
        .execute();
    }
}
