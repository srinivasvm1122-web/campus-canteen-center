import { Response } from 'express';
import { EventEmitter } from 'events';

class OrderEventManager extends EventEmitter {
  private clients: Set<Response> = new Set();

  public addClient(res: Response) {
    this.clients.add(res);
  }

  public removeClient(res: Response) {
    this.clients.delete(res);
  }

  public broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch (err) {
        this.clients.delete(client);
      }
    }
  }
}

export const orderEvents = new OrderEventManager();
