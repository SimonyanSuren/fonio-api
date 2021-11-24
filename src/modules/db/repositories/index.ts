import { UsersRepository } from './users.repository'
// import { AccountsRepository } from './accounts.repository'
import { CompaniesRepository } from './companies.repository'
import { CallFlowsRepository } from './callFlow.repository'
import { CountrysRepository } from './contries.repository'
import { DidsRepository } from './did.repository'
import { PaymentsRepository } from './payments.repository'
import { PlansRepository } from './plan.repository'
import { ProvincesRepository } from './provinces.repository'
import { TokensRepository } from './tokens.repository'
import { BlacklistsRepository } from './blacklists.repository'
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class Repositories {

    constructor(
        @Inject('DidsRepository')
        public readonly DID: DidsRepository,
        public readonly PLAN: PlansRepository,
        public readonly COUNTRY: CountrysRepository,
        public readonly PROVINCE: ProvincesRepository,
        public readonly BLACKLISTS: BlacklistsRepository,
        public readonly CALL_FLOW: CallFlowsRepository,
        // public readonly ACCOUNTS: AccountsRepository,
        public readonly COMPANY: CompaniesRepository,
        public readonly PAYMENTS: PaymentsRepository,
        public readonly USERS: UsersRepository,
        public readonly TOKEN: TokensRepository,
    ) { }

}

export { UsersRepository } from './users.repository'
// export { AccountsRepository } from './accounts.repository'
export { CompaniesRepository } from './companies.repository'
export { CallFlowsRepository } from './callFlow.repository'
export { CountrysRepository } from './contries.repository'
export { DidsRepository } from './did.repository'
export { PaymentsRepository } from './payments.repository'
export { PlansRepository } from './plan.repository'
export { ProvincesRepository } from './provinces.repository'
export { TokensRepository } from './tokens.repository'
export { BlacklistsRepository } from './blacklists.repository'
