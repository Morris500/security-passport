require("dotenv").config();
const express =  require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const schema = mongoose.Schema;

const app = express();
const port = 3000;

//middleware
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

//database middle
const url ="mongodb://localhost:27017/SECRET";

mongoose.connect(url).then((result) => {console.log("database connected")})
.catch((err) => {console.log(err)});

const Secretschema = new schema ({
    email: String,
    password: String
});

const secret = process.env.SECRET ;
Secretschema.plugin(encrypt, { secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", Secretschema);

app.route("/")
.get((req, res)=> {
res.render("home")
});

app.route("/login")
.get((req, res)=> {
   res.render("login") 
})
.post((req, res) => {
   const username = req.body.username;
   const password = req.body.password;

    User.find({email:username}).then((result) => { 
        result.forEach((element)=> {
          console.log(element.email);  
 bcrypt.compare(password, element.password).then(function(response) {
            // result == true
            if (element.email === username && response == true) {
                res.render("secrets");
            } else {
               res.render("login"); 
            } } )
            
        });
           
//     for (let i = 0; i < result.length; i++) {
//     const element = result[i].password;
//     console.log(element);
// }

} )
.catch((err) => console.log(err)) 

 })

app.route("/register")
.get((req, res)=> {

   res.render("register") 
})
.post((req, res) => {

    bcrypt.hash(req.body.password, saltRounds).then(function(hash) {
        // Store hash in your password DB.
        const user1 = new User ({
            email: req.body.username,
            password: hash
        });
        console.log(hash);
        user1.save().then((result)=> {console.log("successful") 
         res.render("secrets") })
        .catch((err) => console.log(err))
    });
    
})


// User.find({email:"user@1.com"}).then((result) => { 
//     for (let i = 0; i < result.length; i++) {
//         const element = result[i].password;
//          console.log(element);
//     }
// });
// User.find({email:"user@1.com"}).then((err, result) => {
//     console.log(err);
//})
app.listen(port, (req, res)=> {console.log("server is running on port 3000") });

