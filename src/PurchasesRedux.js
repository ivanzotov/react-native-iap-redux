import { AsyncStorage } from 'react-native';
import * as RNIap from 'react-native-iap';
import Purchase from './Purchase';
import PurchasesCollection from './PurchasesCollection';
import DEFAULT_CONFIG from './config';

export default class PurchasesRedux {
  constructor(config = {}) {
    this.__config = { ...DEFAULT_CONFIG, ...config };
    this.Purchase = Purchase(this);
    this.PurchasesCollection = PurchasesCollection(this);
  }

  getStore = () => this.__store;
  setStore = store => (this.__store = store);

  getConfig = () => this.__config;

  configure = config => (this.__config = { ...this.__config, ...config });

  reducer = (state = new this.PurchasesCollection([]), action) => {
    const { redux_action_type_load, redux_action_type_buy } = this.getConfig();

    switch (action.type) {
      case redux_action_type_load: {
        return action.payload;
      }
      case redux_action_type_buy: {
        return this.PurchasesCollection.deserialize([
          ...state.serialize(),
          action.payload.serialize(),
        ]);
      }
      default:
        return state;
    }
  };

  get reducerKey() {
    return this.getConfig().redux_reducer_key;
  }

  init = async reduxStore => {
    this.setStore(reduxStore);
    const store = this.getStore();
    const { async_storage_key, redux_action_type_load } = this.getConfig();

    const json = await AsyncStorage.getItem(async_storage_key);
    const purchases = JSON.parse(json);
    const collection = this.PurchasesCollection.deserialize(purchases || []);

    store.dispatch({
      type: redux_action_type_load,
      payload: collection,
    });
  };

  restore = async () => {
    const store = this.getStore();
    const { redux_action_type_load } = this.getConfig();

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

      this.persist();
    } catch (err) {
      throw err
    } finally {
      await RNIap.endConnection();
    }
  };

  getState = () => {
    const store = this.getStore();
    const { redux_reducer_key } = this.getConfig();
    return store.getState()[redux_reducer_key];
  };

  persist = async () => {
    const { async_storage_key } = this.getConfig();
    const raw = this.getState().serialize();
    const json = JSON.stringify(raw);
    await AsyncStorage.setItem(async_storage_key, json);
  };
}
