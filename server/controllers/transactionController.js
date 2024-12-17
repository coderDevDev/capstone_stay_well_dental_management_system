import config from '../config.js';

import {
  createOrder,
  getOrderList,
  getLayAwayOrderList
} from '../cypher/order.js';
import {
  authenticateUserMiddleware,
  auditTrailMiddleware
} from './../middleware/authMiddleware.js';

import { v4 as uuidv4 } from 'uuid';
import { child } from 'firebase/database';

const {
  cypherQuerySession,
  mySqlDriver,
  cypherQuerySessionDriver,
  defaultDBName
} = config;

function createID(datePart, rowIndex) {
  const dateFormatted = datePart.split('/').join('');
  const formattedIndex = String(rowIndex).padStart(2, '0'); // Ensure two digits
  const id = dateFormatted + formattedIndex;
  return id;
}

function formatDate() {
  const date = new Date(); // Get the current date
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based, so add 1
  let day = date.getDate().toString().padStart(2, '0');
  let year = date.getFullYear().toString().slice(-2); // Get the last two digits of the year

  return `${month}/${day}/${year}`;
}

export const addOrder = async (req, res, next) => {
  try {
    let loggedInUser = req.user;

    let data = req.body;

    let adminEmail = req.user.email;

    let adminUserID = req.user.email;

    data.adminUserID = adminUserID;

    let [results] = await mySqlDriver.execute(`
      SELECT COUNT(*) AS count FROM transactions
      `);

    const rowIndex = results[0].count + 1; // Increment row index by 1
    const generatedID = createID(formatDate(), rowIndex);

    data.id = generatedID;
    await mySqlDriver.execute(createOrder(data));
    await auditTrailMiddleware({
      employeeId: loggedInUser.EmployeeID,
      action: 'Added an order'
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
export const listOrder = async (req, res, next) => {
  try {
    let customerId = req.body.customerId;
    let transactionId = req.body.transactionId;

    let type = req.body.type;

    let status = req.body.status;

    const sql = 'SELECT * FROM pricing';

    const [results] = await mySqlDriver.execute(sql);
    let { Amount_Per_Gram_Brand_New, Amount_Per_Gram_Subasta } = results[0];

    console.log({ Amount_Per_Gram_Brand_New, Amount_Per_Gram_Subasta });
    let selectedPrice = 0;
    if (type === 'layaway') {
      var [result] = await mySqlDriver.execute(
        getLayAwayOrderList(customerId, transactionId, status)
      );

      if (result.Category === 'BRAND NEW') {
        selectedPrice = Amount_Per_Gram_Brand_New;
      } else {
        selectedPrice = Amount_Per_Gram_Subasta;
      }

      res.json({
        success: true,
        data: result.map(item => {
          if (item.Category === 'BRAND NEW') {
            selectedPrice = Amount_Per_Gram_Brand_New;
          } else {
            selectedPrice = Amount_Per_Gram_Subasta;
          }

          return {
            ...item,
            orinalPricePerGram: selectedPrice
          };
        })
      });
    } else {
      var [result] = await mySqlDriver.execute(
        getOrderList(customerId, transactionId, status)
      );

      res.json({
        success: true,
        data: result.map(item => {
          if (item.Category === 'BRAND NEW') {
            selectedPrice = Amount_Per_Gram_Brand_New;
          } else {
            selectedPrice = Amount_Per_Gram_Subasta;
          }

          return {
            ...item,
            orinalPricePerGram: selectedPrice
          };
        })
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};

export const makePayment = async (req, res, next) => {
  try {
    // let customerId = req.body.customerId;
    let transactionId = req.body.TransactionID;

    let uploadPath = req.body.data;
    let filename = req.file.filename;

    // fs.move('../tempDir/' + fileName, '../tempDir/' + dir + '/' + fileName, function (err) {
    //     if (err) {
    //         return console.error(err);
    //     }

    //     res.json({});
    // });

    console.log({
      transactionId,
      uploadPath,
      filename
    });

    // var [result] = await mySqlDriver.execute(
    //   getOrderList(customerId, transactionId)
    // );

    // res.json({ success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).send(error.message);
  }
};
