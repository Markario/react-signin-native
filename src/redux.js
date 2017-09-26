export { ActionTypes } from 'redux-signin';
export { Selectors } from 'redux-signin';
export { Reducers } from 'redux-signin';

import { AsyncStorage } from 'react-native';
import { MakeActions } from 'redux-signin';
export const Actions = MakeActions({
	getItem: AsyncStorage.getItem, 
	setItem: AsyncStorage.setItem, 
	removeItem: AsyncStorage.removeItem
});