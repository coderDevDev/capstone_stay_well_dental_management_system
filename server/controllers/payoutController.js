import ShortUniqueId from 'short-unique-id';
import { PayoutRepo } from '../repository/payout.js';
import config from '../config.js';

import { v4 as uuidv4 } from 'uuid';

export const createPayoutRequest = async (req, res, next) => {
  try {
    let data = req.body;

    let type = data.type || 'dailyBonus&&binaryIncome';

    console.log({ type });

    let serviceFee = 0.1;
    let processFee = 50;
    if (type === 'giftChequeIncome') {
      serviceFee = 0;
      processFee = 0;
    } else {
      serviceFee = 0.1; // 10% percent
      processFee = 50; // PHP
    }

    let rawTotalIncome =
      data.list
        // .filter(p => p.name !== 'giftChequeIncome') //need tp filter giftCheque to exclude in 10%
        .reduce(
          (acc, current) => {
            return acc + current.quantity;
          },

          0
        ) || 0;

    let serviceFeeTotalDeduction = rawTotalIncome * serviceFee;

    let totalDeduction = serviceFeeTotalDeduction + processFee;

    let grandTotal = rawTotalIncome - totalDeduction;

    let loggedInUser = req.user;

    const { randomUUID } = new ShortUniqueId({ length: 5 });

    let insertData = {
      ID: uuidv4(),
      type: type,
      userID: loggedInUser.ID,
      dateTimeAdded: Date.now(),
      grandTotal: grandTotal,
      rawTotal: rawTotalIncome,
      totalDeduction,
      rawData: JSON.stringify(data.list),
      computationConfig: JSON.stringify({
        serviceFee,
        processFee
      }),

      status: 'PENDING', // APPROVED, COMPLETED, FAILED
      invoiceCode: randomUUID()
    };
    await PayoutRepo.createPayout(insertData);

    res.status(200).json({
      success: true,
      message: 'created_successfully'
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
};

export const listPayout = async (req, res, next) => {
  try {
    let loggedInUser = req.user;

    let list = await PayoutRepo.listPayout(loggedInUser.ID);
    res.status(200).json({
      success: true,
      message: 'success',
      data: list
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const listPayoutAsAdmin = async (req, res, next) => {
  try {
    let data = await PayoutRepo.listPayoutAsAdmin();

    res.status(200).json({
      success: true,
      message: 'success',
      data
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const getPayout = async (req, res, next) => {
  try {
    let ID = req.params.ID;

    let [data] = await PayoutRepo.getPayout(ID);

    let formatData = {
      ...data,
      rawData: JSON.parse(data.rawData),
      computationConfig: JSON.parse(data.computationConfig)
    };

    res.status(200).json({
      success: true,
      message: 'success',
      data: formatData
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

export const changePayoutStatus = async (req, res, next) => {
  try {
    let ID = req.body.ID;

    let { status, remarks } = req.body;

    let [data] = await PayoutRepo.getPayout(ID);

    let dateOfApproval =
      status === 'APPROVED' ? Date.now() : data.dateOfApproval || '';
    let dateCompleted =
      status === 'COMPLETED' ? Date.now() : data.dateCompleted || '';

    await PayoutRepo.updatePayout(ID, {
      status,
      remarks,
      dateModified: Date.now(),
      dateOfApproval,
      dateCompleted
    });

    res.status(200).json({
      success: true,
      message: 'success'
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
export const listDeductionHistory = async (req, res, next) => {
  try {
    let loggedInUser = req.user;

    let list = await PayoutRepo.listDeductionHistory(loggedInUser.ID);

    res.status(200).json({
      success: true,
      message: 'success',
      data: list
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: error.message });
  }
};
