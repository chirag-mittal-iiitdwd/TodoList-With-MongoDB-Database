//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-chirag:watch123@cluster0.wx7b9.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + buttom to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {
    Item.find({},function(err,docs){
        if(err){
            console.log(err);
        }
        else{
            if(docs.length===0){
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("Successfully Inserted the default items");
                    }
                });
            }
            res.render("list", { listTitle: "Today", newListItems: docs });
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item=new Item({
        name:itemName
    });
    if(listName==="Today"){
        item.save();
        res.redirect('/');
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    });
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndDelete(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Item Deleted Successfully");
                res.redirect("/");
            }
        });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,docs){
            if(!err){
                res.redirect("/"+listName);
            }
        });
    }
});

app.get("/about", function (req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function () {
    console.log("Server started on port 3000 : http://localhost:3000/ or on dynamically generated port");
});