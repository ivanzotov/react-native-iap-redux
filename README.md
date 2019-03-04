# React Native IAP Redux

## How to use

### Configure

```js
import ReactNativeIapRedux from 'react-native-iap-redux';

const config = {
  async_storage_key: 'purchases',
  redux_reducer_key: 'purchases',
  redux_action_type_load: 'LOAD_PURCHASES',
  redux_action_type_buy: 'BUY_PURCHASE',
};

export default new ReactNativeIapRedux(config);
```

### Set up Reducer

```js
import IapRedux from './iapRedux'

const rootReducer = combineReducers({
  [IapRedux.reducerKey]: IapRedux.reducer,
});
```

### Define purchases somewhere

```js
import IapRedux from './iapRedux'

export default {
  purchase1: new IapRedux.Purchase('com.purchase.example')
}
```

### Preload from AsyncStorage

```js
import IapRedux from './iapRedux'
import store from './store';

await IapRedux.init(store)
```

### Buy

```js
async onPress(purchase) {
  if (!purchase.isAvailable()) {
    const info = await purchase.getInfo()
    Alert.alert(
      info.title,
      info.description,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: `Buy for ${info.localizedPrice}`, onPress: () => purchase.buy()
        },
        {
          text: 'Restore purchases',
          onPress: () => IapRedux.restore(),
        },
      ]
    )
  }
}
```
