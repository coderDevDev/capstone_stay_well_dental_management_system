import util from 'util';

export const createSupplier = data => {
  let { SupplierName, PhoneNo, Email, adminFullName } = data;
  const queryText = `
INSERT INTO supplier
(
SupplierName, 
PhoneNo, 
Email, 
Admin_Fname,
Added_By) 

VALUES (
'${SupplierName}',
'${PhoneNo}',
'${Email}',
'${adminFullName}',
''

)

  `;

  return queryText;
};

export const getSupplierList = () => {
  let queryText;

  queryText = `
  SELECT * FROM  supplier 
  where is_deleted != 1
  ORDER BY Date_Modified DESC

  `;

  return queryText;
};

export const createSupplierPayment = data => {
  let {
    SupplierID,
    OrderID,
    Date,
    Payment_Status,
    Amount,
    Payment_Method,
    Added_By,
    Proof_Payment,
    Admin_Fname
  } = data;

  // console.log({ Proof_Payment });
  let queryText;

  queryText = `


INSERT INTO supplier_payment
(
SupplierID, 
OrderID,
Date, 
Payment_Status,
Amount,
Payment_Method,
Added_By, 
Proof_Payment, 
Admin_Fname

) 


VALUES (
'${SupplierID}',
'${OrderID}',
'${Date}', 
'${Payment_Status}',
'${Amount}',
'${Payment_Method}',
'${Added_By}', 
'${Proof_Payment}', 
'${Admin_Fname}'

)
     

  `;

  return queryText;
};

export const updateSupplier = (ID, updatedData) => {
  let queryText;

  queryText = `
      UPDATE supplier_payment SET ?

      where PaymentID  = ?
     

  `;

  return queryText;
};

export const getSupplierPaymentHistory = (SupplierID, OrderID) => {
  let queryText;

  queryText = `
  SELECT * FROM  supplier_payment
  
  where SupplierID = '${SupplierID}'

  ${OrderID ? `AND OrderID = '${OrderID}'` : ''}

  order by Date DESC

  `;

  return queryText;
};
