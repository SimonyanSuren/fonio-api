import { BaseAbstractRepository } from './base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '../../../models';


@Injectable()
export class PlansRepository extends BaseAbstractRepository<Plan>  {

  constructor(@InjectRepository(Plan)
              private readonly plansRepository:Repository<Plan>,
  ) {
    super(plansRepository);
  }

}