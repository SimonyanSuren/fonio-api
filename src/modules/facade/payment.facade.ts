import {Injectable} from '@nestjs/common';
import {EntityRepository, EntityManager} from "typeorm";
import {Payment} from "../../models/";
import * as moment from "moment";

@EntityRepository()
@Injectable()
export class PaymentFacade {

    constructor(private entityManager: EntityManager) { }

    async getListAll(offset=0, limit=10, orderBy, orderType, filerBy?, filterValue?) {
        let query = this.entityManager.createQueryBuilder(Payment, 'pay')
            .leftJoinAndSelect("pay.invoice", "inv")
            .leftJoinAndSelect("pay.user", "user");

        let orderField;
        switch (orderBy) {
            case 'id':
                orderField = 'pay.pay_id'
                break;
            case 'payOn':
                orderField = 'pay.pay_on'
                break;
            case 'userEmail':
                orderField = 'user.email';
                break;
            case 'amount':
                orderField = 'pay.pay_amount';
                break;
            case 'transactionId':
                orderField = 'pay.transaction_id';
                break;
            case 'payWith':
                orderField = 'pay.pay_with';
                break;
        }
        query.orderBy(`${orderField}`, (orderType === 'desc' || orderType === 'descending') ? "DESC" : "ASC");

        if (filerBy && filterValue){
            let dbField, dbValue, dbOperator;
            switch (filerBy) {
                case 'payOn':
                    let dateMoment = moment(filterValue);
                    query.where(`pay.pay_on between :val1 and :val2`, {
                        val1: dateMoment.startOf('day').toDate(),
                        val2: dateMoment.endOf('day').toDate()
                    });
                    break;
                case 'userEmail':
                    dbField = 'user.email';
                    dbValue = `%${filterValue}%`;
                    dbOperator = 'like';
                    break;
                case 'amount':
                    dbField = 'pay.pay_amount';
                    dbValue = parseFloat(filterValue)
                    dbOperator = '=';
                    break;
                case 'transactionId':
                    dbField = 'pay.transaction_id';
                    dbValue = `%${filterValue}%`;
                    dbOperator = 'like';
                    break;
                case 'payWith':
                    dbField = 'pay.pay_with';
                    dbValue = `%${filterValue}%`;
                    dbOperator = 'like';
                    break;
            }
            if (dbField) {
                query.where(`${dbField} ${dbOperator} :value`, { value: dbValue });
            }
        }
        query.offset(offset);
        query.limit(limit);

        return query.getManyAndCount();
    }

}
