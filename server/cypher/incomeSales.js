import util from 'util';
export const addIncome = data => {
  let { type, userID, relatedEntityID, dateList } = data;

  let newData = {
    ...data,
    dateList: dateList ? JSON.stringify(dateList) : false
  };

  let { dateTimeAdded, ...updatedData } = newData;
  const queryText = `

     MERGE (n:IncomeSales {
        type: '${type}',
        userID: '${userID}',
        relatedEntityID: '${relatedEntityID}'

     })

     ON CREATE SET n += ${util.inspect(newData)}
     ON MATCH SET n += ${util.inspect(updatedData)}


     RETURN *

 

  `;

  return queryText;
};

export const getIncomeDailyBonus = (relatedEntityID, userId, type) => {
  const queryText = `
  
 
  MATCH (p: IncomeSales
    {
      userID: '${userId}',
      type: '${type}'
    }
    
    )
  where  p.relatedEntityID = '${relatedEntityID}'

  return  properties(p) as data

  `;

  return queryText;
};

export const getIncomeByType = (type, userID) => {
  const queryText = `
  
 
  MATCH (p: IncomeSales
    {
      userID: '${userID}'
    }
    )
  where  p.type  = '${type}'
with p
  order by p.dateTimeAdded DESC
  return  collect(properties(p)) as data

  `;

  return queryText;
};

export const recievedDailyBonus = (ID, newData) => {
  let data = JSON.stringify(newData);
  const queryText = `
  
 
  MATCH (p: IncomeSales)
  where  p.ID  = '${ID}'
    SET p.dateList = ${util.inspect(data)}


  `;

  return queryText;
};
