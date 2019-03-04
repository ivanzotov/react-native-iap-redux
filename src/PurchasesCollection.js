import Purchase from './index'

export class PurchasesCollection {
  static deserialize = (raw) => {
    const purchases = raw.map(it => Purchase.deserialize(it))
    return new PurchasesCollection(purchases)
  }

  constructor(purchase) {
    this.__purchases = purchases
  }

  getPurchases() {
    return this.__purchases
  }

  serialize = () => {
    return this.getPurchases().map(it => it.serialize())
  }
}
