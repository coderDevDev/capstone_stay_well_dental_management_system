import util from 'util';

export const createOrder = data => {
  let {
    CustomerID,
    Facebook,
    Category,
    SupplierID,
    Grams,
    Price,
    adminUserID,
    ItemName,
    id,
    orderID,
    itemNames
  } = data;
  let queryText;

  console.log({ itemNames });
  queryText = `


  INSERT INTO transactions(
      uuid,
      CustomerID, 
      SupplierID,
      Facebook,
      Price,
      Category,
      Grams,
      Status,
      Modified_By,
      ItemName,
      proof_of_payment,
      orderID,
      itemNames
 )
        VALUES (
        '${id}',
       '${CustomerID}',
       '${SupplierID}',
       '${Facebook}',
       '${Price}',
       '${Category}',
       '${Grams}',
       'IN_PROGRESS',
       '${adminUserID}',
        '${ItemName}',
        '',
        '${orderID}',
       '${JSON.stringify(itemNames)}'
)

  `;

  return queryText;
};

export const getOrderList = (customerId, transactionId, status) => {
  let queryText;

  queryText = `
SELECT *
FROM transactions


LEFT JOIN customer_record ON transactions.CustomerID = customer_record.CustomerID



${
  status === 'CANCELLED'
    ? `where transactions.Status = 'CANCELLED'`
    : `where transactions.Status <> 'CANCELLED'`
}

${customerId ? `AND transactions.CustomerID = '${customerId}'` : ``}


${transactionId ? `AND transactions.transactionId = '${transactionId}'` : ``}

ORDER BY Date_Created DESC

  `;

  console.log(queryText);

  return queryText;
};

export const getLayAwayOrderList = (customerId, LayawayID) => {
  let queryText;

  queryText = `
SELECT *
FROM layaway


LEFT JOIN customer_record ON layaway.CustomerID  = customer_record.CustomerID


${customerId ? `where layaway.CustomerID = '${customerId}'` : ``}


${LayawayID ? `AND layaway.LayawayID  = '${LayawayID}'` : ``}

ORDER BY Date_Created DESC


  `;

  return queryText;
};

export const updateOrder = (transactionId, status, proof_of_payment) => {
  let queryText;

  queryText = `
UPDATE transactions 
SET 

status = '${status}' ,
proof_of_payment  = '${proof_of_payment}' 

WHERE TransactionID = '${transactionId}' LIMIT 1

  `;

  return queryText;
};

export const adminupdateOrder = (transactionId, status, comments) => {
  let queryText;

  queryText = `
UPDATE transactions 
SET 

status = '${status}' ,
admin_comments = '${comments}'

WHERE TransactionID = '${transactionId}' LIMIT 1

  `;

  return queryText;
};
