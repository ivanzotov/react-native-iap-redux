import { Alert } from 'react-native';
import * as RNIap from 'react-native-iap';

export default ({ getStore, getConfig, getState, persist }) =>
  class Purchase {
    static deserialize = function(raw) {
      return new this(raw);
    };

    constructor(sku) {
      this.sku = sku;
    }

    serialize = () => this.sku;

    getInfo = async () => {
      const products = await RNIap.getProducts([this.sku]);
      return products[0];
    };

    isAvailable = () => getState().isAvailable(this);

    buy = async () => {
      const store = getStore();
      const { redux_action_type_buy } = getConfig();
      await RNIap.initConnection();

      try {
        await RNIap.buyProduct(this.sku);
        store.dispatch({ type: redux_action_type_buy, payload: this });
        persist();
      } catch (err) {
        Alert.alert(err.code, err.message);
      }

      await RNIap.endConnection();
    };
  };
