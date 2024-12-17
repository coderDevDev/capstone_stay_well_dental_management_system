import { CronJob, sendAt } from 'cron';
import { format, isSunday } from 'date-fns';

import { codeTypeRepo } from '../repository/codeType.js';
import config from '../config.js';
import cron from 'node-cron';
import { incomeSalesRepo } from '../repository/incomeSales.js';
import { packageRepo } from '../repository/package.js';
import { v4 as uuidv4 } from 'uuid';

let dateNow = new Date(
  new Date().toLocaleString('en', { timeZone: 'Asia/Singapore' })
);

console.log(`Today is ${dateNow}`);

let everyMidnightExceptSunday = `0 5 6 * * 1-7`; // Mon - Sunday  @ 12:10 AM

const funcToExecute = async () => {
  try {
    let packageList = await packageRepo.listPackage();
    let listCodeTypeList = await codeTypeRepo.listCodeType();
    let codes = await codeTypeRepo.getCodeListForDailyProfit();

    console.log('execute daily task reward');

    await Promise.all(
      codes.map(async ({ packageType, userID, codeTypeName }) => {
        let foundAmuletPackage = packageList.find(p => {
          return p.name === packageType;
        });

        let codeType = listCodeTypeList.find(ct => {
          return ct.name === codeTypeName;
        });

        let dailyBonusAmount =
          foundAmuletPackage && foundAmuletPackage.dailyBonusAmount;
        let isActiveForDailyBonus = codeType && codeType.isActiveForDailyBonus;
        console.log({ dailyBonusAmount, packageType, userID });

        if (isActiveForDailyBonus) {
          // create DailBonusV
          await incomeSalesRepo.addIncome({
            ID: uuidv4(),
            type: 'DAILY_BONUS',
            userID: userID,
            dateTimeAdded: Date.now(),
            relatedEntityID: '',
            amountInPhp: dailyBonusAmount
          });
        } else {
        }
      })
    );

    console.log('cron jobs completed');
  } catch (error) {
    console.log(error);
  }
};
export const dailyProfitScheduleJob = async () => {
  await funcToExecute();
  // const job = new CronJob(
  //   everyMidnightExceptSunday, // cronTime
  //   async function () {
  //     await funcToExecute();
  //   }, // onTick
  //   null, // onComplete
  //   true, // start
  //   'Asia/Manila' // timeZone
  // );
};
