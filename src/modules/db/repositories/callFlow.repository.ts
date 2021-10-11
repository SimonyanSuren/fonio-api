import { BaseAbstractRepository } from './base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CallFlow } from '../../../models';



@Injectable()
export class CallFlowsRepository extends BaseAbstractRepository<CallFlow>  {

  constructor(@InjectRepository(CallFlow)
              private readonly CallFlowRepository:Repository<CallFlow>,
  ) {
    super(CallFlowRepository);
  }

}