import { AsyncStorage, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import Purchase from './Purchase';
import PurchasesCollection from './PurchasesCollection';
import DEFAULT_CONFIG from './config'

export default class PurchasesRedux {
  constructor(config = {}) {
    this.__config = { ...DEFAULT_CONFIG, ...config };
    this.Purchase = Purchase(this.__config)
    this.PurchasesCollection = PurchasesCollection(this.__config)
  }

  getConfig = () => this.__config;

  configure = config => (this.__config = { ...this.__config, ...config });

  reducer = (state = [], action) => {
    const { redux_action_type_load, redux_action_type_buy } = this.getConfig();

    switch (action.type) {
      case redux_action_type_load:
        return action.payload;
      case redux_action_type_buy:
        return [...state, action.sku];
      default:
        return state;
    }
  };

  get reducerKey() {
    return this.getConfig().redux_reducer_key
  }

  preload = async () => {
    const {
      store,
      async_storage_key,
      redux_action_type_load,
    } = this.getConfig();

    const json = await AsyncStorage.getItem(async_storage_key);
    const purchases = JSON.parse(json);

    store.dispatch({
      type: redux_action_type_load,
      payload: this.PurchasesCollection.deserialize(purchases || []),
    });
  };

  restore = async () => {
    const {
      store,
      async_storage_key,
      redux_action_type_load,
    } = this.getConfig();

    await RNIap.initConnection();

    try {
      const availablePurchases = await RNIap.getAvailablePurchases();
      const purchases = availablePurchases.map(
        it => new this.Purchase(it.productId)
      );
      const collection = new this.PurchasesCollection(purchases);

      store.dispatch({
        type: redux_action_type_load,
        payload: collection,
      });

      const raw = collection.serialize();
      const json = JSON.stringify(raw);
      await AsyncStorage.setItem(async_storage_key, json);
    } catch (err) {
      Alert.alert(`Ошибка: ${err.code}`, err.message);
    }

    await RNIap.endConnection();
  };

  getState = () => {
    const { store, redux_reducer_key } = this.getConfig();
    return store.getState()[redux_reducer_key];
  };
}
