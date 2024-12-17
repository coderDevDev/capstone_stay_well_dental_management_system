





`MATCH (fromParent:User{ID:'d241dbd1-c384-4289-bd73-94a5025f9ba8'})-[e:has_invite*]->(child:User) 
MATCH (n:Network{childID:child.ID}) 
MATCH (d:ChildFloater{childID:child.ID}) 


// parent

MATCH (i:IncomeSales{userID:'d241dbd1-c384-4289-bd73-94a5025f9ba8',type:'DIRECT_SPONSORSHIP_SALES_MATCH'}) 
MATCH (x:MatchSalesV{userID_processed:'d241dbd1-c384-4289-bd73-94a5025f9ba8'})
MATCH (y:MatchSalesV{userID_processed:'d1114747-dd4f-484d-baec-16d14b4c9ba4'})


RETURN n,d,x,i,child,y`

 marichu ramos
`
MATCH (child:User {ID: '1c6ec04c-ac72-4d91-b4c2-dd8955c4b609'}) 
MATCH (network:Network{ childID:child.ID }) 
MATCH (childFloater:ChildFloater{childID:child.ID}) 
 MATCH (incomeSales:IncomeSales {
    userID: child.ID
}) WHERE incomeSales <> 'DAILY_BONUS'

RETURN *
`;
