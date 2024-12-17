import {
  createPayout,
  listPayout,
  getPayout,
  listPayoutAsAdmin,
  updatePayout,
  listPayoutWithStatus,
  listDeductionHistory
} from '../cypher/payout.js';

import config from '../config.js';
const { cypherQuerySession } = config;
import { transformIntegers } from '../helpers/transfromIntegers.js';
import { codeTypeRepo } from '../repository/codeType.js';
export const PayoutRepo = {
  createPayout: async data => {
    await cypherQuerySession.executeQuery(createPayout(data));
  },
  listPayout: async userID => {
    let codeTypeList = await codeTypeRepo.listCodeType();
    let { records } = await cypherQuerySession.executeQuery(listPayout(userID));
    const [list] = records[0]._fields;

    let result = transformIntegers(list);

    let mapped = result.map(res => {
      let computationConfig = JSON.parse(res.computationConfig);
      let rawTotalIncome = res.rawTotal;
      let serviceFee = computationConfig.serviceFee;
      let processFee = computationConfig.processFee;

      let serviceFeeTotalDeduction = rawTotalIncome * serviceFee;

      let fsCodeTotalDeduction = 0;

      if (res.userInfo.codeType === 'FREE_SLOT') {
        let foundFSCodeType = codeTypeList.find(
          r => r.codeType === 'FREE_SLOT'
        );

        let fsCodeDeductionFee =
          (foundFSCodeType && foundFSCodeType.additionalDeductionFee) || 0.1;
        fsCodeTotalDeduction = rawTotalIncome * fsCodeDeductionFee;
      }

      let totalDeduction =
        serviceFeeTotalDeduction + processFee + fsCodeTotalDeduction;

      let grandTotal = rawTotalIncome - totalDeduction;

      let dateOfApproval = res.dateOfApproval || res.dateModified;
      return {
        ...res,
        totalDeduction,
        grandTotal,
        dateOfApproval
      };
    });

    return mapped;
  },
  listPayoutAsAdmin: async () => {
    let codeTypeList = await codeTypeRepo.listCodeType();
    let { records } = await cypherQuerySession.executeQuery(
      listPayoutAsAdmin()
    );
    const [list] = records[0]._fields;

    let result = transformIntegers(list);

    let mapped = result.map(res => {
      let computationConfig = JSON.parse(res.computationConfig);
      let rawTotalIncome = res.rawTotal;
      let serviceFee = computationConfig.serviceFee;
      let processFee = computationConfig.processFee;

      let serviceFeeTotalDeduction = rawTotalIncome * serviceFee;

      let fsCodeTotalDeduction = 0;

      if (res.userInfo.codeType === 'FREE_SLOT') {
        let foundFSCodeType = codeTypeList.find(
          r => r.codeType === 'FREE_SLOT'
        );

        let fsCodeDeductionFee =
          (foundFSCodeType && foundFSCodeType.additionalDeductionFee) || 0.1;
        fsCodeTotalDeduction = rawTotalIncome * fsCodeDeductionFee;
      }

      let totalDeduction =
        serviceFeeTotalDeduction + processFee + fsCodeTotalDeduction;

      let grandTotal = rawTotalIncome - totalDeduction;

      let dateOfApproval = res.dateOfApproval || res.dateModified;
      return {
        ...res,
        totalDeduction,
        grandTotal,
        dateOfApproval,
        fullName: `${res.userInfo.firstName} ${res.userInfo.lastName}`
      };
    });

    return mapped;
  },
  getPayout: async ID => {
    let codeTypeList = await codeTypeRepo.listCodeType();
    let { records } = await cypherQuerySession.executeQuery(getPayout(ID));
    var [payoutData, userInfo, codeInfo] = records[0]._fields;

    let [pData] = transformIntegers([{ ...payoutData }]);

    let { password, ...otherProps } = userInfo;

    let fsCodeTotalDeduction = 0;
    if (codeInfo.type === 'FREE_SLOT') {
      console.log({ payoutData });
      let rawTotalIncome = pData.rawTotal;
      let foundFSCodeType = codeTypeList.find(r => r.codeType === 'FREE_SLOT');

      let fsCodeDeductionFee =
        (foundFSCodeType && foundFSCodeType.additionalDeductionFee) || 0.1;
      fsCodeTotalDeduction = rawTotalIncome * fsCodeDeductionFee;
    }

    return transformIntegers([
      {
        ...pData,
        fsCodeTotalDeduction: fsCodeTotalDeduction,
        userInfo: { ...otherProps, ...codeInfo }
      }
    ]);
  },
  getRemainingIncomeSalesPerType: async userID => {
    let { records } = await cypherQuerySession.executeQuery(listPayout(userID));
    const [list] = records[0]._fields;

    let flattenData = transformIntegers(list);

    let totalQuantityToDeduct = flattenData.reduce(
      (acc, current) => {
        // console.log(JSON.parse(res.rawData));
        // return JSON.parse(res.rawData);

        let result = JSON.parse(current.rawData);

        let foundDailyBonus =
          result.find(list => {
            return list.name === 'dailyBonus';
          }) || 0;

        let foundBinaryIncome =
          result.find(list => {
            return list.name === 'binaryIncome';
          }) || 0;
        let foundGiftChequeIncome =
          result.find(list => {
            return list.name === 'giftChequeIncome';
          }) || 0;

        return {
          dailyBonus:
            acc.dailyBonus +
            ((foundDailyBonus && foundDailyBonus.quantity) || 0),
          binaryIncome:
            acc.binaryIncome +
            ((foundBinaryIncome && foundBinaryIncome.quantity) || 0),
          giftChequeIncome:
            acc.giftChequeIncome +
            ((foundGiftChequeIncome && foundGiftChequeIncome.quantity) || 0)
        };
        // return {
        //   ...acc,
        //   [current[key]]: [...(result[acc[key]] || []), current]
        // };
      },
      {
        dailyBonus: 0,
        binaryIncome: 0,
        giftChequeIncome: 0
      }
    );

    return totalQuantityToDeduct;
  },
  getWithdrawnIncomePerType: async (userID, status) => {
    let { records } = await cypherQuerySession.executeQuery(
      listPayoutWithStatus(userID, status)
    );
    const [list] = records[0]._fields;

    let flattenData = transformIntegers(list);

    let totalWithdrawnIncomePerType = flattenData.reduce(
      (acc, current) => {
        // console.log(JSON.parse(res.rawData));
        // return JSON.parse(res.rawData);

        let result = JSON.parse(current.rawData);

        let foundDailyBonus =
          result.find(list => {
            return list.name === 'dailyBonus';
          }) || 0;

        let foundBinaryIncome =
          result.find(list => {
            return list.name === 'binaryIncome';
          }) || 0;
        let foundGiftChequeIncome =
          result.find(list => {
            return list.name === 'giftChequeIncome';
          }) || 0;

        return {
          dailyBonus:
            acc.dailyBonus +
            ((foundDailyBonus && foundDailyBonus.quantity) || 0),
          binaryIncome:
            acc.binaryIncome +
            ((foundBinaryIncome && foundBinaryIncome.quantity) || 0),
          giftChequeIncome:
            acc.giftChequeIncome +
            ((foundGiftChequeIncome && foundGiftChequeIncome.quantity) || 0)
        };
        // return {
        //   ...acc,
        //   [current[key]]: [...(result[acc[key]] || []), current]
        // };
      },
      {
        dailyBonus: 0,
        binaryIncome: 0,
        giftChequeIncome: 0
      }
    );

    return totalWithdrawnIncomePerType;
  },
  updatePayout: async (ID, data) => {
    await cypherQuerySession.executeQuery(updatePayout(ID, data));
  },
  listDeductionHistory: async userID => {
    let codeTypeList = await codeTypeRepo.listCodeType();
    let { records } = await cypherQuerySession.executeQuery(
      listDeductionHistory(userID)
    );
    const [list] = records[0]._fields;

    let result = transformIntegers(list);

    let mapped = result.map(res => {
      let computationConfig = JSON.parse(res.computationConfig);
      let rawTotalIncome = res.rawTotal;
      let serviceFee = computationConfig.serviceFee;
      let processFee = computationConfig.processFee;

      let serviceFeeTotalDeduction = rawTotalIncome * serviceFee;

      let fsCodeTotalDeduction = 0;

      if (res.userInfo.codeType === 'FREE_SLOT') {
        let foundFSCodeType = codeTypeList.find(
          r => r.codeType === 'FREE_SLOT'
        );

        let fsCodeDeductionFee =
          (foundFSCodeType && foundFSCodeType.additionalDeductionFee) || 0.1;
        fsCodeTotalDeduction = rawTotalIncome * fsCodeDeductionFee;
      }

      let totalDeduction =
        serviceFeeTotalDeduction + processFee + fsCodeTotalDeduction;

      let grandTotal = rawTotalIncome - totalDeduction;

      let dateOfApproval = res.dateOfApproval || res.dateModified;
      return {
        ...res,
        totalDeduction,
        grandTotal,
        dateOfApproval,
        fsCodeTotalDeduction
      };
    });

    return mapped;
  }
};
