import {
  addIncome,
  getIncomeDailyBonus,
  getIncomeByType,
  recievedDailyBonus
} from '../cypher/incomeSales.js';

import config from '../config.js';
const { cypherQuerySession } = config;
import { transformIntegers } from '../helpers/transfromIntegers.js';

let incomeSalesType = [
  {
    type: 'GIFT_CHECK'
  },
  {
    type: 'DIRECT_REFERRAL', // from user registration, base on package selection
    done: true
  },
  {
    type: 'DIRECT_SPONSORSHIP_SALES_MATCH',
    computation: points => {
      return points * 0.3;
    },
    done: true
  },
  {
    type: 'MATCH_SALES',
    done: true
  }
];

function toISOLocal(d) {
  const z = n => ('0' + n).slice(-2);
  let off = d.getTimezoneOffset();
  const sign = off < 0 ? '+' : '-';
  off = Math.abs(off);
  return (
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, -1) +
    sign +
    z((off / 60) | 0) +
    ':' +
    z(off % 60)
  );
}

let dateNow = new Date(
  new Date().toLocaleString('en', { timeZone: 'Asia/Singapore' })
);
let formatDate = toISOLocal(dateNow);

console.log({ formatDate });

export const incomeSalesRepo = {
  incomeSalesType,
  addIncome: async data => {
    if (data.type === 'DAILY_BONUS') {
      let dateNow = new Date(
        new Date().toLocaleString('en', { timeZone: 'Asia/Singapore' })
      );
      let formatDate = toISOLocal(dateNow);

      let dateIdentifier = formatDate.split('T')[0];

      // if (data.dateIdentifier) {
      //   dateIdentifier = data.dateIdentifier;
      // }

      let year = new Date().getFullYear();

      // get the current data

      let { records } = await cypherQuerySession.executeQuery(
        getIncomeDailyBonus(`${year}`, data.userID, 'DAILY_BONUS')
      );

      let dateList = [
        {
          dateTimeAdded: Date.now(),
          dateIdentifier,
          amountInPhp: data.amountInPhp
        }
      ];
      if (records.length > 0) {
        let result = records[0]._fields;
        let current = result[0];

        dateList = JSON.parse(current.dateList);

        let mapped = dateList.find(current => {
          return current.dateIdentifier === dateIdentifier;
        });

        if (!mapped) {
          dateList.push({
            dateTimeAdded: Date.now(),
            dateIdentifier,
            amountInPhp: data.amountInPhp
          });
        }
      }

      let updatedData = {
        ...data,
        dateList,
        year
      };

      await cypherQuerySession.executeQuery(
        addIncome({
          ...updatedData,
          relatedEntityID: `${year}`
        })
      );
    } else if (data.type === 'DIRECT_REFERRAL') {
      await cypherQuerySession.executeQuery(addIncome(data));
    } else {
      await cypherQuerySession.executeQuery(addIncome(data));
    }
    return true;
  },
  manualAddIncomeTaskReward: async (data, dateToInsert) => {
    let dateNow = new Date(
      new Date(dateToInsert).toLocaleString('en', {
        timeZone: 'Asia/Singapore'
      })
    );

    let formatDate = toISOLocal(dateNow);

    let dateIdentifier = formatDate.split('T')[0];

    let year = new Date().getFullYear();
    let { records } = await cypherQuerySession.executeQuery(
      getIncomeDailyBonus(`${year}`, data.userID, 'DAILY_BONUS')
    );

    let dateList = [
      {
        dateTimeAdded: Date.now(),
        dateIdentifier,
        amountInPhp: data.amountInPhp
      }
    ];

    if (records.length > 0) {
      let result = records[0]._fields;
      let current = result[0];

      dateList = JSON.parse(current.dateList);

      let mapped = dateList.find(current => {
        return current.dateIdentifier === dateIdentifier;
      });

      console.log(mapped);
      if (!mapped) {
        dateList.push({
          dateTimeAdded: Date.now(),
          dateIdentifier,
          amountInPhp: data.amountInPhp
        });
      }
    }

    let updatedData = {
      ...data,
      dateList,
      year
    };

    await cypherQuerySession.executeQuery(
      addIncome({
        ...updatedData,
        relatedEntityID: `${year}`
      })
    );

    return true;
  },
  getIncomeByType: async ({ type = '', userID }) => {
    let { records } = await cypherQuerySession.executeQuery(
      getIncomeByType(type, userID)
    );
    const [sales] = records[0]._fields;

    return transformIntegers(sales);
  },
  recievedDailyBonus: async ({ ID, newData }) => {
    await cypherQuerySession.executeQuery(recievedDailyBonus(ID, newData));
  }
};
