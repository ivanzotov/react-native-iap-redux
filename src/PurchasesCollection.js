export default ({ Purchase }) =>
  class PurchasesCollection {
    static deserialize = function(raw) {
      const purchases = raw.map(it => Purchase.deserialize(it));
      return new this(purchases);
    };

    constructor(purchases) {
      this.__purchases = purchases;
    }

    getPurchases = () => this.__purchases;

    isAvailable = purchase => {
      return !!this.getPurchases().find(it => it.sku === purchase.sku);
    };

    serialize = () => this.getPurchases().map(it => it.serialize());
  };
