import util from 'util';

export const createCodeType = ({ codeType, data }) => {
  let { ID, ...otherProps } = data;
  let updateData = {
    ...otherProps
  };

  const queryText = `
  
 
  MERGE (ct: CodeType {
   name: '${codeType}'
  })
  
  on create  SET ct += ${util.inspect(data)}

  on match  SET ct += ${util.inspect(updateData)}

  return *

  `;

  return queryText;
};

export const listCodeType = () => {
  const queryText = `
  
 
  MATCH (ct: CodeType )
 
  return collect(properties(ct)) as data

  `;

  return queryText;
};

export const createCodeBundle = ({
  bundleId,
  name,
  isApproved,
  displayName
}) => {
  let bundleData = {
    bundleId,
    dateTimeAdded: Date.now(),
    isApproved,
    displayName
  };

  const queryText = `
  
 
  MERGE (cb:CodeBundle {
    bundleId: '${bundleId}'
  })

  with cb 
  MATCH (ct: CodeType {
   name: '${name}'
  })
  
  
  MERGE (ct)-[:has_bundle]->(cb)

  ON CREATE  SET cb += ${util.inspect(bundleData)}

  return *


  `;

  return queryText;
};

export const createNewCode = ({ name, bundleId, codeData }) => {
  let budleData = {
    bundleId,
    dateTimeAdded: Date.now()
  };

  const queryText = `

  
  MERGE (c:Code {
    name: '${codeData.name}'
  })

  with c
  MATCH (ct: CodeType {
   name: '${name}'
  })
  
  with c, ct
  MATCH (cb:CodeBundle {
    bundleId: '${bundleId}'
  })
  with c, ct, cb

  MERGE (cb)-[:has_code]->(c)
  ON CREATE  SET c += ${util.inspect(codeData)}



  return *

  `;

  return queryText;
};

export const listCodes = ({ isApproved = true }) => {
  const queryText = `
  
  MATCH (ct: CodeType )-[:has_bundle]->(cb:CodeBundle
   {
    isApproved: ${isApproved}
   } 
    
    )
  MATCH (cb)-[:has_code]->(c: Code )
      with c 
       order by c.dateTimeUpdated DESC
        return collect(properties(c)) as c

  `;

  return queryText;
};

export const countTotalBundleByType = ({ name }) => {
  const queryText = `
  
  MATCH (ct: CodeType {
   name: '${name}'
  })
  
  MATCH (ct)-[:has_bundle]->(cb:CodeBundle)

  RETURN COUNT(cb)

  `;

  return queryText;
};

export const listPendingCode = () => {
  const queryText = `


  MATCH (ct: CodeType )-[:has_bundle]->(cb:CodeBundle
   {
    isApproved: false
   } 
    )
    MATCH (cb)-[:has_code]->(c: Code )
    with c ,cb
    order by c.dateTimeUpdated ASC
    WITH cb, collect(properties(c)) as codes
 return COLLECT({ bundleId: cb.bundleId,dateTimeAdded: cb.dateTimeAdded , displayName: cb.displayName, codeList : codes})


  `;

  return queryText;
};

export const updatePendingCodes = ({ bundleId, isApproved = true }) => {
  let data = {
    isApproved,
    dateTimeApproved: Date.now()
  };

  const queryText = `


  MATCH (ct: CodeType )-[:has_bundle]->(cb:CodeBundle
    {
  bundleId: '${bundleId}'
    }
    )
    MATCH (cb)-[:has_code]->(c: Code )

  SET cb += ${util.inspect(data)}
  SET c += ${util.inspect(data)}

  RETURN * 
 

  `;

  return queryText;
};

export const getCode = name => {
  const queryText = `


  MATCH (ct: CodeType )-[:has_bundle]->(cb:CodeBundle
   {
    isApproved: true
   } 
    )
    MATCH (cb)-[:has_code]->(c: Code {
       name: '${name}'

    })
   

    return properties(c) as data


  `;

  return queryText;
};

export const updateCodeByName = (name, updateData) => {
  let data = {
    ...updateData
  };

  const queryText = `



  MATCH (c: Code {

    name: '${name}'
  })

  SET c += ${util.inspect(data)}

  RETURN * 
 

  `;

  return queryText;
};

export const getCodeListForDailyProfit = () => {
  const queryText = `


  MATCH (ct: CodeType )-[:has_bundle]->(cb:CodeBundle
   {
    isApproved: true
   } 
   )
    MATCH (cb)-[:has_code]->(c: Code {
      status : 'USED'
   })

   where c.isActive IS NULL or c.isActive = true
   
   with ct, c, collect(properties(c)) as codes

    return collect({
      codeTypeName: ct.name,
      packageType:c.packageType,
      userID: c.userID
    }) as data


  `;

  return queryText;
};

export const getCodeByUserId = userId => {
  const queryText = `


    MATCH (c: Code {
       userID: '${userId}'

    })
   

    return properties(c) as data


  `;

  return queryText;
};
