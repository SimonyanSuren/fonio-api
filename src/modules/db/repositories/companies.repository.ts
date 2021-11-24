import { BaseAbstractRepository } from './base.abstract.repository';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from '../../../models';


@Injectable()
export class CompaniesRepository extends BaseAbstractRepository<Company>  {

  constructor(@InjectRepository(Company)
              private readonly companiesRepository:Repository<Company>,
  ) {
    super(companiesRepository);
  }

}