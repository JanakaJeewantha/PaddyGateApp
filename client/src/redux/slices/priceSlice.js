import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { emitPriceUpdate } from '../../socket';

// Use the /current endpoint for fetching only latest prices per mill+variety
const API_URL = 'http://localhost:5000/api/prices';

const initialState = {
  prices: [],
  priceHistory: [],
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: ''
};

// Get only current/latest prices per mill+variety
export const getPrices = createAsyncThunk(
  'prices/getAll',
  async (filters, thunkAPI) => {
    try {
      let url = `${API_URL}/current`;
      if (filters) {
        const queryParams = new URLSearchParams(filters).toString();
        url = `${API_URL}/current?${queryParams}`;
      }
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get price history
export const getPriceHistory = createAsyncThunk(
  'prices/getHistory',
  async ({ millId, riceVariety }, thunkAPI) => {
    try {
      const response = await axios.get(`${API_URL}/history/${millId}/${riceVariety}`);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update price
export const updatePrice = createAsyncThunk(
  'prices/update',
  async (priceData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.post(API_URL, priceData, config);
      // Emit socket event for real-time updates
      emitPriceUpdate(response.data);
      return response.data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const priceSlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    updatePriceInState: (state, action) => {
      // For real-time updates via socket.io
      const updatedPrice = action.payload;
      const index = state.prices.findIndex(
        (price) => (price.millId._id || price.millId) === (updatedPrice.millId._id || updatedPrice.millId)
          && price.riceVariety === updatedPrice.riceVariety
      );
      if (index !== -1) {
        state.prices[index] = updatedPrice;
      } else {
        state.prices.push(updatedPrice);
      }
    },
    clearPriceHistory: (state) => {
      state.priceHistory = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPrices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.prices = action.payload;
      })
      .addCase(getPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getPriceHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPriceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.priceHistory = action.payload;
      })
      .addCase(getPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updatePrice.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedPrice = action.payload;
        const index = state.prices.findIndex(
          (price) => (price.millId._id || price.millId) === (updatedPrice.millId._id || updatedPrice.millId)
            && price.riceVariety === updatedPrice.riceVariety
        );
        if (index !== -1) {
          state.prices[index] = updatedPrice;
        } else {
          state.prices.push(updatedPrice);
        }
      })
      .addCase(updatePrice.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, updatePriceInState, clearPriceHistory } = priceSlice.actions;
export default priceSlice.reducer;