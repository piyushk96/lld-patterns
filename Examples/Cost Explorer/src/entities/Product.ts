import { TierType } from "../constants";

interface IProduct {
  name: string;
  tiers: Partial<Record<TierType, number>>;
}

export class Product implements IProduct {
  name: string;
  tiers: Partial<Record<TierType, number>>;

  constructor(aname: string, tiers: Partial<Record<TierType, number>>) {
    this.name = aname;
    this.tiers = tiers;
  }
}