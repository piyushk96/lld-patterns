import { ISubscription } from "./Subscription";

export class Customer {
  id: string;
  name: string;
  subscriptions: ISubscription[];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.subscriptions = [];
  }

  addSubscription(subs: ISubscription) {
    this.subscriptions.push(subs);
  }

  getSubscriptions() {
    return this.subscriptions;
  }
}