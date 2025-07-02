import { IOClients } from '@vtex/api';

export default class Clients extends IOClients {
  public get status() {
    return this.get<Status>('status', {
      headers: {
        'VtexIdclientAutCookie': this.context.authToken,
      },
      timeout: 5000
    });
  }
}

interface Status {
  code: number
  message: string
}
