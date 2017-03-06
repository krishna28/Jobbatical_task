module.exports = function(app,express,db){
    
    var api = express.Router();
    var max = 5;
    var page = 0;
    var offset = page * max;

    
      api.get('/topActiveUsers',function(req,res){
         page = +req.query.page; //will convert string to int

        if(page){
            offset = +(page-1) * max;
        }


        db.any("select u.id,u.name,u.created_at createdAt,count(app.user_id) , array_agg(listings.name ORDER BY listings.created_by desc) as listings from users u left join applications app on (u.id = app.user_id  and  app.created_at > current_date - interval '7 days') left join listings on u.id = listings.created_by group by u.id order by u.id LIMIT $1 OFFSET $2", [max,offset])
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


                var customRes = {
                    id:"",
                    name:"",
                    createdAt:"",
                    companies:[],
                    createdListings:[],
                    applications:[]
                }

                    if(req.query.id){
                        id = req.query.id;
                    }else{
                     res.json({"code":"400",message:"please pass id as query string. Ex /api/users?id=1"})   
                    }

                  db.task(t=> {
                    return t.one("select u.id,u.name,u.created_at from users u where id = $1", [id])
                    .then(user => {
                        customRes.id= user.id;
                        customRes.name= user.name;
                        customRes.createdAt = user.created_at;
                         return db.any("select c.id, c.name, c.created_at, t.contact_user from companies c inner join teams t on (c.id = t.company_id and t.user_id = $1)",[customRes.id])
                        // return t.any("SELECT * from applications where user_id = $1", [user.id]);
                    })
                    .then(companies=>{
                        customRes.companies = companies
                        return  db.any("select l.id,l.created_at createdAt,l.name,l.description from listings l  where l.created_by = $1",[customRes.id]) 
                    })
                   })
                    .then(listings=> {
                        console.log("listings are as follows" ,listings);
                        customRes.createdListings= listings
                      return db.any("select app.id,app.created_at createdAt,app.cover_letter,l.id,l.description,l.name from applications app , listings l where l.id = app.listing_id and app.user_id = $1",[customRes.id])
                        // success
                    })
                    .then(applications=>{
                       customRes.applications= applications; 
                        res.json(customRes)
                    })
                .catch(error=> {
                       res.json({"code":"500",message:"server side issue."})
                    // error
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