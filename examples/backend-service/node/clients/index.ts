import { IOClients } from '@vtex/api';
import { MasterData } from '@vtex/clients';

export class Clients extends IOClients {
  public get masterdata() {
    return this.getOrSet('masterdata', MasterData);
  }
}
