import { configureStore } from '@reduxjs/toolkit';
import headerSlice from '../features/common/headerSlice';
import modalSlice from '../features/common/modalSlice';
import rightDrawerSlice from '../features/common/rightDrawerSlice';
import leadsSlice from '../features/leads/leadSlice';

import appSettingsSlice from '../features/settings/appSettings/appSettingsSlice';

import cartReducer from '../features/payoutCart/index';

const combinedReducer = {
  header: headerSlice,
  rightDrawer: rightDrawerSlice,
  modal: modalSlice,
  lead: leadsSlice,
  appSettings: appSettingsSlice,
  cart: cartReducer
};

export default configureStore({
  reducer: combinedReducer
});
