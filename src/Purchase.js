import * as RNIap from 'react-native-iap';

export default ({ getStore, getConfig, getState, persist }) =>
  class Purchase {
    static deserialize = function(raw) {
      return new this(raw);
    };

    constructor({ sku }) {
      this.sku = sku;
    }

    serialize = () => ({ sku: this.sku });

    getInfo = async () => {
      const products = await RNIap.getProducts([this.sku]);
      return products.find(it => it.productId === this.sku);
    };

    isAvailable = () => getState().isAvailable(this);

    buy = async () => {
      const store = getStore();
      const { redux_action_type_buy } = getConfig();
      await RNIap.initConnection();

      try {
        const product = await RNIap.requestPurchase(this.sku, false);
        store.dispatch({ type: redux_action_type_buy, payload: this });
        persist();
        await RNIap.finishTransaction(product, false);
      } catch (err) {
        throw err;
      } finally {
        await RNIap.endConnectionAndroid();
      }
    };
  };
