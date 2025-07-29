import { TierType } from "../constants";
import { Product } from "./Product";

export interface ISubscription {
  product: Product;
  tier: TierType
  subscribeDate: Date;

  getMonthlyCost(): number;
}

export class Subscription implements ISubscription {
  product: Product;
  tier: TierType;
  subscribeDate: Date;

  constructor(product: Product, atier: TierType) {
    this.product = product;
    this.tier = atier;
    this.subscribeDate = new Date();
  }

  getMonthlyCost() {
    return this.product.tiers[this.tier] as number;
  }
}