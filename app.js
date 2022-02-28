//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();



app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://{username}:{password}@cluster0.i1m3m.mongodb.net/todolistDB");

const itemsSchema={

    name: String
};

const Item=mongoose.model
(
"Item",itemsSchema

);

const item1=new Item(
    {
        name : "Item 1"
    }
);

const item2=new Item(
    {
        name : "Item 2"
    }
);

const item3=new Item(
    {
        name : "Item 3"
    }
);

const defaultItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model(

    "List",listSchema
);


app.get("/",function(req,res){
 

    Item.find({},function(err,founditems){

        if(founditems.length===0){
            Item.insertMany(defaultItems,function(err){

                if(err){
                    console.log("Failed");
                }
                else{
                    console.log(" Database saved successfully");
                    res.redirect("/");
                }
            
            });
        }

        res.render('list', {ListTile: "Groceries",newItems: founditems});
    });



})


app.post("/",function(req,res){

const   itemname=req.body.chore;
const   listname=req.body.list;

const itemadd=new Item(
    {
        name : itemname
    }
);

if(listname==="Groceries"){

    itemadd.save();
    res.redirect("/");
}
else{
    List.findOne({name:listname},function(err,foundlist){
     
        foundlist.items.push(itemadd);
        foundlist.save();
        res.redirect("/"+listname);
    });
}



})


app.post("/delete",function(req,res){

    const itemid=req.body.checkbox;
    const listname=req.body.list;

    if(listname==="Groceries"){

        Item.findByIdAndRemove(itemid,function(err){

            if(!err){
                console.log("Deleted Successfully");
                res.redirect("/");
            }
    
        });
    }    
  else{
      List.findOneAndUpdate({name:listname}, {$pull: {items:{_id:itemid}}},function(err,foundlist){
           if(!err){
               res.redirect("/" + listname);
           }
      } 
      );
  }
  
})

app.get("/:custname",function(req,res){
   const custListName= _.capitalize(req.params.custname);

  

   List.findOne({name:custListName},function(err,foundlist){
    if(!err){
     if(!foundlist){
        const listitem=new List(
            {
                name:custListName,
                items:defaultItems
            }
        );
     
        listitem.save();
        res.redirect("/" + custListName);

     }else{

        res.render('list', {ListTile:foundlist.name ,newItems: foundlist.items});
     }
    
    }
   });


})

app.get("/about/app",function(req,res){
    res.render('about');
})

app.listen(process.env.PORT || 3000,function(){
    console.log("Listening at port 3000");
});

app.get('/favicon.ico', (req, res) => res.status(204).end()); 