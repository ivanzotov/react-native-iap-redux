import { Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import DEFAULT_CONFIG from './config'

export default (config = DEFAULT_CONFIG) => class Purchase {
  static deserialize = raw => new Purchase(raw);

  constructor(sku) {
    this.sku = sku;
  }

  serialize = () => this.sku;

  getInfo = async () => {
    const products = await RNIap.getProducts([this.sku]);
    return products[0];
  };

  buy = async () => {
    const { store, redux_action_type_buy } = config;
    await RNIap.initConnection();

    try {
      await RNIap.buyProduct(this.sku);
      store.dispatch({ type: redux_action_type_buy, sku: this.sku });
    } catch (err) {
      Alert.alert(`Ошибка: ${err.code}`, err.message);
    }

    await RNIap.endConnection();
  };
}
