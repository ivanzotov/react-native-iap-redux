import { AsyncStorage, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import Purchase from './Purchase';

export class PurchasesCollection {
  static DEFAULT_REDUX_STORE = null;
  static CONFIG = {
    async_storage_key: 'purchases',
    redux_reducer_key: 'purchases',
    redux_action_type_load: 'LOAD_PURCHASES',
    redux_action_type_buy: 'BUY_PURCHASE',
  };

  static reducer = (state = [], action) => {
    switch (action.type) {
      case PurchasesCollection.CONFIG.redux_action_type_load:
        return action.payload;
      case PurchasesCollection.CONFIG.redux_action_type_buy:
        return [...state, action.sku];
      default:
        return state;
    }
  };

  static loadFromAsyncStorageToReduxStore = async (
    reduxStore = PurchasesCollection.DEFAULT_REDUX_STORE
  ) => {
    const json = await AsyncStorage.getItem(
      PurchasesCollection.CONFIG.async_storage_key
    );
    const purchases = JSON.parse(json);

    reduxStore.dispatch({
      type: PurchasesCollection.CONFIG.redux_action_type_load,
      payload: PurchasesCollection.deserialize(purchases || []),
    });
  };

  static restorePurchases = async (
    reduxStore = PurchasesCollection.DEFAULT_REDUX_STORE
  ) => {
    await RNIap.initConnection();

    try {
      const availablePurchases = await RNIap.getAvailablePurchases();
      const purchases = availablePurchases.map(
        it => new Purchase(it.productId)
      );
      const collection = new PurchasesCollection(purchases);

      reduxStore.dispatch({
        type: PurchasesCollection.CONFIG.redux_action_type_load,
        payload: collection,
      });

      const raw = collection.serialize();
      const json = JSON.stringify(raw);
      await AsyncStorage.setItem(
        PurchasesCollection.CONFIG.async_storage_key,
        json
      );
    } catch (err) {
      Alert.alert(`Ошибка: ${err.code}`, err.message);
    }

    await RNIap.endConnection();
  };

  static deserialize = raw => {
    const purchases = raw.map(it => Purchase.deserialize(it));
    return new PurchasesCollection(purchases);
  };

  static fromReduxStore = (
    reduxStore = PurchasesCollection.DEFAULT_REDUX_STORE
  ) => reduxStore.getState()[PurchasesCollection.CONFIG.redux_reducer_key];

  static isAvailable = (
    purchase,
    reduxStore = PurchasesCollection.DEFAULT_REDUX_STORE
  ) => {
    const collection = PurchasesCollection.fromReduxStore(reduxStore);
    return collection.getPurchases().indexOf(purchase) !== -1;
  };

  constructor(purchases) {
    this.__purchases = purchases;
  }

  getPurchases = () => this.__purchases;

  serialize = () => this.getPurchases().map(it => it.serialize());
}
