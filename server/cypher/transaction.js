import util from 'util';

export const getAllParentNodes = ({ ID }) => {
  const queryText = `
    MATCH (a: User { ID: '${ID}'})
    OPTIONAL MATCH (a)<-[:has_invite*]-(parent: User)
     with a,parent ORDER BY parent.DEPTH_LEVEL DESC  
    RETURN {email: a.email, ID: a.ID} as child, 
    collect({ 
     email: parent.email, 
     ID: parent.ID,
     position: parent.position
    }) as parents

  `;

  return queryText;
};

export const checkIfMatchExist = ({ ID, aliasSet }) => {
  const queryText = `
    MATCH (parent { ID: '${ID}'})
    OPTIONAL MATCH (parent)-[:has_invite*]->(children)  
    where children.ID_ALIAS IN ${JSON.stringify(aliasSet)}
    RETURN count(children) as children_count

  `;

  return queryText;
};

export const checkIfPairExist = ({ ID, name }) => {
  const queryText = `

    MATCH(pairing:Pairing ) 

    where pairing.name = '${name}'


    RETURN count(pairing) as children_count

  `;

  return queryText;
};

export const addPairingNode = params => {
  let {
    ID,
    aliasSet,
    parentId,
    pairMatched,
    currentDepthLevel,
    ...otherParams
  } = {
    ...params
  };

  let newData = {
    ID: ID,
    source_user_id: parentId,
    aliasSet: aliasSet,
    pairMatched: pairMatched,
    status: 'PENDING',
    targetDepthLevel: currentDepthLevel,
    name: aliasSet.join('='),
    date_created: Date.now()
  };

  let updateData = {
    source_user_id: parentId,
    aliasSet: aliasSet,
    pairMatched: pairMatched,
    status: 'PENDING',
    targetDepthLevel: currentDepthLevel,
    name: aliasSet.join('='),
    date_updated: Date.now()
  };
  const queryText = `
 
     MERGE (pairing:Pairing {
       name: '${newData.name}',
       source_user_id: '${parentId}'
      })
      
     ON CREATE 
     SET pairing += ${util.inspect(newData)}
     ON MATCH SET 
     pairing += ${util.inspect(updateData)}
    with pairing
     MATCH (u:User {
      ID: '${parentId}'
     })
     MERGE(u)-[e:has_pair_match]->(pairing) 
     RETURN  *

 

  `;

  return queryText;
};

export const getAllMatchPairById = ({ ID = false, status = 'PENDING' }) => {
  const queryText = `

  ${
    ID
      ? `
  
    MATCH (u { ID: '${ID}'})
    OPTIONAL MATCH (parent)-[:has_pair_match]->(pairing:Pairing)  

    RETURN collect(properties(pairing)) as pairings
  
  `
      : `
      
    MATCH (User)-[:has_invite]-> (target_user:User)

    MATCH (pairing:Pairing)

    where target_user.ID_ALIAS IN pairing.aliasSet



    with  pairing, COLLECT({
        INDEX_PLACEMENT: target_user.INDEX_PLACEMENT,
        email : target_user.email,
        ID: target_user.ID,
        firstName: target_user.firstName,
        lastName: target_user.lastName,
        ID_ALIAS: target_user.ID_ALIAS
        
        }) as u_list
    

    RETURN collect({
        ID: pairing.ID,
        status: pairing.status,
        source_user_id: pairing.source_user_id,
         name: pairing.name,
        targetDepthLevel: pairing.targetDepthLevel,
        users : u_list

    })
      
      `
  }
  

  `;

  return queryText;
};

export const getPairingNode = ({ ID, userId, status }) => {
  const queryText = `

  ${
    userId
      ? `MATCH (u:User {
    ID: '${userId}'
  })-[e:has_pair_match]-> (pairing: Pairing {

    status: '${status}'
  })

return collect(properties(pairing)) as pairings

  
  
  
  `
      : `
    MATCH( pairing:Pairing {
       ID: '${ID}'
    } ) 

     
    RETURN properties(pairing) as details 
      
      
      `
  }
  


  `;

  return queryText;
};

export const updatePairingNode = data => {
  let { ID, ...otherParams } = data;
  const queryText = `
    MATCH( pairing:Pairing {
       ID: '${ID}'
    } ) 

   SET pairing += ${util.inspect(otherParams)}
   RETURN properties(pairing) as details

  `;

  return queryText;
};
