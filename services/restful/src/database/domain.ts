import type { PrimaryKey } from '@dime/type';
import type { CreateServerRequest } from './types';

export abstract class Domain {
  abstract addDomain(): void;
  abstract addSubDomain(): void;
  abstract addCustomDomain(): void;
}
export abstract class Server {
  abstract create(req: CreateServerRequest): void;
  abstract status(server_id: PrimaryKey): void;
  abstract info(server_id: PrimaryKey): void;
}
