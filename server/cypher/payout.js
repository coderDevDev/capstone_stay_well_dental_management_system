import util from 'util';
export const createPayout = data => {
  const queryText = `

     CREATE (p:PayoutV)

     SET p += ${util.inspect(data)}

     RETURN p

  `;

  return queryText;
};

export const listPayout = userID => {
  const queryText = `

   MATCH (p:PayoutV {
      userID: '${userID}'
     })

   MATCH (u:User {
        ID:  p.userID
    })

   OPTIONAL MATCH (c: Code {
      status : 'USED',
      userID:  u.ID
   })

   with p,c,u
   order by p.dateTimeAdded DESC
 
   RETURN  collect({
    ID: p.ID,
    rawData: p.rawData,
    dateTimeAdded: p.dateTimeAdded,
    grandTotal: p.grandTotal,
    status: p.status,
    rawTotal: p.rawTotal,
    dateModified:p.dateModified,
    dateOfApproval: p.dateOfApproval,
    dateCompleted: p.dateCompleted,
    type:p.type,
    computationConfig: p.computationConfig,
    userInfo: {
      firstName: u.firstName,
      lastName: u.lastName,
      displayID: u.displayID,
      ID: u.ID,
      codeType:c.type
    }
   })

  `;

  return queryText;
};

export const listPayoutWithStatus = (userID, status) => {
  const queryText = `

   MATCH (p:PayoutV {
      userID: '${userID}'
     })

   ${
     status === 'COMPLETED'
       ? `
      where p.status  =  '${status}'
   `
       : `
   
   where p.status <> 'COMPLETED' 
   
   
   `
   }
   with p
   order by p.dateTimeAdded DESC
 
   RETURN COLLECT(properties(p)) as data

  `;

  return queryText;
};

export const listPayoutAsAdmin = () => {
  const queryText = `

   MATCH (p:PayoutV )
   MATCH (u:User {
        ID:  p.userID
    })

   OPTIONAL MATCH (c: Code {
      status : 'USED',
      userID:  u.ID
   })
   where c.isActive IS NULL or c.isActive = true

   with p,u,c



   order by p.dateTimeAdded DESC

 with p, u,c
 
   RETURN  collect({
    ID: p.ID,
    rawData: p.rawData,
    dateTimeAdded: p.dateTimeAdded,
    grandTotal: p.grandTotal,
    status: p.status,
    rawTotal: p.rawTotal,
    dateModified:p.dateModified,
    dateOfApproval: p.dateOfApproval,
    dateCompleted: p.dateCompleted,
    type:p.type,
    computationConfig: p.computationConfig,
    userInfo: {
      firstName: u.firstName,
      lastName: u.lastName,
      displayID: u.displayID,
      ID: u.ID,
      codeType:c.type
    }
   })
  `;

  return queryText;
};

export const getPayout = ID => {
  const queryText = `

   MATCH (p:PayoutV {
      ID: '${ID}'
     })

   MATCH (u:User {
        ID:  p.userID
    })

    OPTIONAL MATCH (c: Code {
      status : 'USED',
      userID:  u.ID
   })
   where c.isActive IS NULL or c.isActive = true

    with p,u,c

 
   RETURN properties(p) as data,  properties(u) as uData, properties(c) as codeData

  `;

  return queryText;
};

export const updatePayout = (ID, data) => {
  const queryText = `

     MATCH (p:PayoutV {
      ID: '${ID}'
     })

     SET p += ${util.inspect(data)}

     RETURN p

  `;

  return queryText;
};

export const listDeductionHistory = userID => {
  const queryText = `

   MATCH (p:PayoutV {
      userID: '${userID}'
     })

   where p.status = 'APPROVED' 
     
  or p.status = 'COMPLETED'

   MATCH (u:User {
        ID:  p.userID
    })

   OPTIONAL MATCH (c: Code {
      status : 'USED',
      userID:  u.ID
   })
where c.isActive IS NULL or c.isActive = true
   with p,c,u
   order by p.dateTimeAdded DESC
 
   RETURN  collect({
    invoiceCode: p.invoiceCode,
    ID: p.ID,
    rawData: p.rawData,
    dateTimeAdded: p.dateTimeAdded,
    grandTotal: p.grandTotal,
    status: p.status,
    rawTotal: p.rawTotal,
    dateModified:p.dateModified,
    dateOfApproval: p.dateOfApproval,
    dateCompleted: p.dateCompleted,
    type:p.type,
    computationConfig: p.computationConfig,
    userInfo: {
      firstName: u.firstName,
      lastName: u.lastName,
      displayID: u.displayID,
      ID: u.ID,
      codeType:c.type
    }
   })

  `;

  return queryText;
};
