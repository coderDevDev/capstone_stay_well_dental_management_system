import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import axios from 'axios';

export const getFeatureList = createAsyncThunk(
  '/featureList/list',
  async () => {
    const response = await axios.post('/featureList/list', {});

    return response.data;
  }
);

export const headerSlice = createSlice({
  name: 'header',
  initialState: {
    packageList: [],
    codeTypeList: []
  },
  reducers: {
    setAppSettings: (state, action) => {
      state.packageList = action.payload.packageList;
    },

    removeNotificationMessage: (state, action) => {
      state.newNotificationMessage = '';
    },

    showNotification: (state, action) => {
      state.newNotificationMessage = action.payload.message;
      state.newNotificationStatus = action.payload.status;
    },
    getAppSettings: (state, action) => {
      return state;
    }
  },

  extraReducers: {
    [getFeatureList.pending]: state => {
      state.isLoading = true;
    },
    [getFeatureList.fulfilled]: (state, action) => {
      let settings = action.payload.data;
      state.isLoading = false;

      Object.keys(settings).map(key => {
        state[key] = settings[key];
      });
    },
    [getFeatureList.rejected]: state => {
      state.isLoading = false;
    }
  }
});

export const {
  setAppSettings,
  removeNotificationMessage,
  showNotification,
  getAppSettings
} = headerSlice.actions;

export default headerSlice.reducer;
