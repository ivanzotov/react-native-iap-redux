import Purchase from './Purchase';
import DEFAULT_CONFIG from './config'

export default (config = DEFAULT_CONFIG) => class PurchasesCollection {
  static deserialize = raw => {
    const purchases = raw.map(it => Purchase.deserialize(it));
    return new PurchasesCollection(purchases);
  };

  constructor(purchases) {
    this.__purchases = purchases;
  }

  getPurchases = () => this.__purchases;

  isAvailable = purchase => {
    return this.getPurchases().indexOf(purchase) !== -1;
  };

  serialize = () => this.getPurchases().map(it => it.serialize());
}
