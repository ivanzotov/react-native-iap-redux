import { AsyncStorage } from 'react-native';
import * as RNIap from 'react-native-iap';

export class Purchase {
  static CONFIG = {
    async_storage_key: 'purchases',
    redux_reducer_key: 'purchases',
    redux_action_type_load: 'LOAD_PURCHASES',
    redux_action_type_buy: 'BUY_PURCHASE',
  };

  static reducer = (state = [], action) => {
    switch (action.type) {
      case Purchase.CONFIG.redux_action_type_load:
        return action.payload;
      case Purchase.CONFIG.redux_action_type_buy:
        return [...state, action.sku];
      default:
        return state;
    }
  };

  static loadFromAsyncStorageToReduxStore = async reduxStore => {
    const json = await AsyncStorage.getItem(Purchase.CONFIG.async_storage_key);
    const purchases = JSON.parse(json);

    reduxStore.dispatch({
      type: Product.CONFIG.redux_action_type_load,
      payload: ProductCollection.deserialize(products || []),
    });
  };

  static deserialize = raw => new Product(raw);

  static restoreProducts = async () => {
    await RNIap.initConnection();

    try {
      const availablePurchases = await RNIap.getAvailablePurchases();
      const products = availablePurchases.map(it => new Purchase(it.productId));
      const collection = new ProductCollection(products);

      store.dispatch({
        type: Purchase.CONFIG.redux_action_type_load,
        payload: collection,
      });

      const raw = collection.serialize();
      const json = JSON.stringify(raw);
      await AsyncStorage.setItem(Product.ASYNC_STORE_KEY, json);
    } catch (err) {
      Alert.alert(`Ошибка: ${err.code}`, err.message);
    }

    await RNIap.endConnection();
  };

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

  isAvailable = () =>
    store.getState()[Purchase.CONFIG.redux_reducer_key].indexOf(this.sku) !==
    -1;

  getInfo = async () => {
    const products = await RNIap.getProducts([this.sku]);
    return products[0];
  };
}
