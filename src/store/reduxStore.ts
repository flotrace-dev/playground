// Redux Toolkit store for the change-highlighting demo. Two slices on purpose
// so FloTrace's Redux panel shows independent state trees and the diff column
// has more to chew on.

import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  totalCents: number;
}

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], totalCents: 0 } as CartState,
  reducers: {
    add: (state, action: PayloadAction<Omit<CartItem, "qty">>) => {
      const existing = state.items.find((i) => i.id === action.payload.id);
      if (existing) existing.qty += 1;
      else state.items.push({ ...action.payload, qty: 1 });
      state.totalCents = state.items.reduce(
        (s, i) => s + i.price * i.qty * 100,
        0
      );
    },
    remove: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.totalCents = state.items.reduce(
        (s, i) => s + i.price * i.qty * 100,
        0
      );
    },
    clear: (state) => {
      state.items = [];
      state.totalCents = 0;
    },
  },
});

interface SessionState {
  userId: number | null;
  loginCount: number;
  lastAction: string;
}

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    userId: null,
    loginCount: 0,
    lastAction: "init",
  } as SessionState,
  reducers: {
    login: (state, action: PayloadAction<number>) => {
      state.userId = action.payload;
      state.loginCount += 1;
      state.lastAction = "login";
    },
    logout: (state) => {
      state.userId = null;
      state.lastAction = "logout";
    },
    touch: (state) => {
      state.lastAction = `touch@${Date.now()}`;
    },
  },
});

export const cartActions = cartSlice.actions;
export const sessionActions = sessionSlice.actions;

export const reduxStore = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    session: sessionSlice.reducer,
  },
});

export type RootState = ReturnType<typeof reduxStore.getState>;
export type AppDispatch = typeof reduxStore.dispatch;
