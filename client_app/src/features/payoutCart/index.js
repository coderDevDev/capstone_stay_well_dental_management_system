import { createSlice, current } from '@reduxjs/toolkit';

let serviceFee = 0.1; // 10%
let processFee = 50;
let comissionDeduction = 0.1;
const cartSlice = createSlice({
  name: 'cart',
  initialState: { list: [], total: 0 },
  reducers: {
    addToCart(state, action) {
      const check = state.list.findIndex(
        amuletPackage => amuletPackage.ID === action.payload.ID
      );
      if (check !== -1) {
        state.list[check].quantity += action.payload.quantity || 0;
      } else {
        state.list.push(action.payload);
      }

      state.total =
        state.list.reduce(
          (sum, amuletPackage) =>
            sum + +amuletPackage?.price + amuletPackage?.quantity,
          0
        ) || 0;
      let minusAllFees = state.total * serviceFee;
      let commissionDeductionFee = state.total * comissionDeduction;
      // state.minusAllFees = minusAllFees;
      state.serviceFeeTotalDeduction = minusAllFees;
      state.processingFeeTotalDeduction = processFee;
      state.commissionDeductionFee = commissionDeductionFee;
      state.grandTotal =
        state.total - (minusAllFees + processFee + commissionDeductionFee);
    },
    updateQuantity(state, action) {
      let { incomeType, quantity } = action.payload;

      const check = state.list.findIndex(
        amuletPackage => amuletPackage.ID === action.payload.ID
      );

      if (check !== -1) {
        state.list[check].quantity = action.payload.quantity || 0;
      }

      state.total =
        state.list
          .filter(p => p.name !== 'giftChequeIncome') //need tp filter giftCheque to exclude in 10%
          .reduce(
            (sum, amuletPackage) => {
              return sum + +amuletPackage?.price + amuletPackage?.quantity;
            },

            0
          ) || 0;
      let minusAllFees = state.total * serviceFee;

      let commissionDeductionFee = state.total * comissionDeduction;

      let giftChequeIncome = current(state.list).find(
        p => p.name === 'giftChequeIncome'
      );
      // if (incomeType === 'giftChequeIncome') {
      //   giftChequeIncomeAmount = quantity;
      // }

      let giftChequeIncomeAmount =
        (giftChequeIncome && giftChequeIncome.quantity) || 0;

      //state.minusAllFees = minusAllFees;
      state.serviceFeeTotalDeduction = minusAllFees;

      state.processingFeeTotalDeduction = processFee;
      state.commissionDeductionFee = commissionDeductionFee;
      state.grandTotal =
        state.total -
        (minusAllFees + processFee + commissionDeductionFee) +
        giftChequeIncomeAmount;
    },
    removeItem(state, action) {
      state.list = state.list.filter(
        amuletPackage => amuletPackage.ID !== action.payload.ID
      );
      state.total =
        state.list.reduce(
          (sum, amuletPackage) =>
            sum + +amuletPackage?.price + amuletPackage?.quantity,
          0
        ) || 0;
    },
    resetCart(state, action) {
      // state.total = 0;
      // let minusAllFees = 0;
      // // state.minusAllFees = minusAllFees;
      // state.serviceFeeTotalDeduction = 0;
      // state.processingFeeTotalDeduction = 0;
      // state.grandTo1tal = 0;
      // state.quantity = 0;

      state.list = state.list.map(data => {
        return {
          ...data,
          quantity: 0
        };
      });
      state.grandTotal = 0;
    }
  }
});

const { actions, reducer } = cartSlice;

export const { addToCart, updateQuantity, removeItem, resetCart } = actions;

export default reducer;
