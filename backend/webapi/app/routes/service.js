module.exports = function(app,express,db){
    
    var api = express.Router();
    var max = 6;
    var page = 0;
    var offset = page * max;


    var arr = [];
    
      api.get('/topActiveUsers',function(req,res){

        if(req.query.page){
            offset = +(req.query.page-1) * max;
        }


        db.any("select users.*, count(users.id) count , array_agg(listings.name) lname from users left join applications on users.id = applications.user_id  left join listings on users.id = listings.created_by  group by users.id,users.id  order by users.id LIMIT $1 OFFSET $2", [max,offset])
                    .then(data => {

                         res.json(data);            
                    })
                    .catch(error => {
                        // error;
                         res.json({status:500,message:'Error in the server'});
                    });
      
       });


      api.get('/users',function(req,res){

        var id = null

        if(req.query.id){
            id = req.query.id;
        }

        db.any("select * from users  where id = $1", [id])
                    .then(data => {

                        // success;

                    res.json(data);  

                    })
                    .catch(error => {

                        // error;
                         res.json({status:500,message:'Error in the server'});
                    });
      
       });




      api.get('/getByTable',function(req,res){

        var tableName = req.query.tableName;
        db.any(`select * from  ${tableName}`,[])
                    .then(data => {

                         res.json(data);
                    })
                    .catch(error => {
                        // error;
                         res.json({status:500,message:'Error in the server'});
                    });
      
       });

        api.post('/insertData',function(req,res){

                  var cover_letter=  "Testing cl";
                     db.any(`insert into applications (created_at, user_id,listing_id,cover_letter) values($1, $2,$3,$4) returning id`,[new Date(),2,6,cover_letter])
                                    .then(data => {

                                         res.json(data);
                                    })
                                    .catch(error => {
                                        // error;
                                         res.json({status:500,message:'Error in the server'});
                                    });
       });



        api.post('/up',function(req,res){

       
             db.any(`update  listings set  created_by = $1 where id = $2`,[2,3])
                                    .then(data => {

                                         res.json(data);
                                    })
                                    .catch(error => {
                                        // error;
                                         res.json({status:500,message:'Error in the server'});
                                    });
       
       });


    
    return api;

}