import { Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import PurchasesCollection from './PurchasesCollection';

export class Purchase {
  static deserialize = raw => new Purchase(raw);

  constructor(sku) {
    this.sku = sku;
  }

  serialize = () => this.sku;

  buy = async () => {
    await RNIap.initConnection();

    try {
      await RNIap.buyProduct(this.sku);
      store.dispatch({
        type: Purchase.CONFIG.redux_action_type_buy,
        sku: this.sku,
      });
    } catch (err) {
      Alert.alert(`Ошибка: ${err.code}`, err.message);
    }

    await RNIap.endConnection();
  };

  getInfo = async () => {
    const products = await RNIap.getProducts([this.sku]);
    return products[0];
  };
}
