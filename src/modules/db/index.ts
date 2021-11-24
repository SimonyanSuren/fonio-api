import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormconfig from '../../../ormconfig';
import { Payment, User, Did, Token, CallFlow, Plan, Province, Country, AccountBlacklist, Company } from '../../models';
import { PaymentsRepository } from './repositories/payments.repository'
import { UsersRepository } from './repositories/users.repository'
import { CompaniesRepository } from './repositories/companies.repository'
// import { AccountsRepository } from './repositories/accounts.repository'

import { DidsRepository } from './repositories/did.repository';
import { TokensRepository } from './repositories/tokens.repository';
import { CallFlowsRepository } from './repositories/callFlow.repository';
import { PlansRepository } from './repositories/plan.repository';
import { CountrysRepository } from './repositories/contries.repository';
import { ProvincesRepository } from './repositories/provinces.repository';
import { BlacklistsRepository } from './repositories';



@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    TypeOrmModule.forFeature([Payment, User, Did, Token, CallFlow, Plan, Province, Country, AccountBlacklist, Company]),
  ],
  controllers: [],
  providers: [PaymentsRepository, UsersRepository, DidsRepository, CallFlowsRepository, TokensRepository, PlansRepository, CountrysRepository, ProvincesRepository, BlacklistsRepository, CompaniesRepository],
  exports: [PaymentsRepository, UsersRepository, DidsRepository, CallFlowsRepository, TokensRepository, PlansRepository, CountrysRepository, ProvincesRepository, BlacklistsRepository, CompaniesRepository]

})
export class DBFactoryModule {
}
