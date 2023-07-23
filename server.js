const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const PORT = 4141;
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const auth = require("./auth.middleware");
require("dotenv").config();
console.log(process.env.DB_STRING);

let db,
  dbConnectionStr = process.env.DB_STRING,
  dbName = "todo";

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then((client) => {
  console.log(`Connected to ${dbName} Database`);
  db = client.db(dbName);
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.get('/',async (request, response)=>{
//     const todoItems = await db.collection('todos').find().toArray()
//     const itemsLeft = await db.collection('todos').countDocuments({completed: false})
//     response.render('index.ejs', { items: todoItems, left: itemsLeft })
// })

app.get("/", async (req, res) => {
  res.render("index5.ejs");
});

app.get("/home", auth, (req, res) => {
  res.render("index2.ejs");
});

app.get("/track", auth, async (req, res) => {
  const formdata = await db.collection("todos").find().toArray();
  res.render("index3.ejs", { formdata: formdata });
});

app.get("/addpermit", auth, async (req, res) => {
  const formdata = await db.collection("todos").find().toArray();
  res.render("index.ejs", { formdata: formdata });
});

app.post("/edit/:id", (req, response) => {
  var ObjectID = require("mongodb").ObjectID;
  const r_id = req.params.id;
  const final_id = new ObjectID(r_id);
  const formData = {
    FSA_Number: req.body.fsaNumber,
    Permit_Link: req.body.permitLink,
    Name: req.body.name,
    Date_Submitted: req.body.dateSubmitted,
    Additional_Info: req.body.additionalInfo,
    City: req.body.city,
    Permit_Type: req.body.permitType,
    Assigned_Permit_Number: req.body.permitNumber,
    Internal_Permit_Number: req.body.internalpermitNumber,
    Internal_Permit_Link: req.body.internalPermitLink,
  };
  db.collection("todos")
    .updateOne({ _id: final_id }, { $set: formData })
    .then((result) => {
      console.log("Form Data changed");
      response.redirect("/track");
    })
    .catch((error) => console.error(error));
});

app.get("/edit/:id", auth, async (req, res) => {
  var ObjectID = require("mongodb").ObjectID;
  const r_id = req.params.id;
  const final_id = new ObjectID(r_id);
  const formdata = await db.collection("todos").findOne({ _id: final_id });
  res.render("index4.ejs", { formdata: formdata });
});

// app.post('/addTodo', (request, response) => {
//     db.collection('todos').insertOne({formdata: request.body.formdata, completed: false})
//     .then(result => {
//         console.log('Todo Added')
//         response.redirect('/')
//     })
//     .catch(error => console.error(error))
// })

app.post("/addpermit", (req, response) => {
  const formData = {
    FSA_Number: req.body.fsaNumber,
    Permit_Link: req.body.permitLink,
    Name: req.body.name,
    Date_Submitted: req.body.dateSubmitted,
    Additional_Info: req.body.additionalInfo,
    City: req.body.city,
    Permit_Type: req.body.permitType,
    Assigned_Permit_Number: req.body.permitNumber,
    Internal_Permit_Number: req.body.internalpermitNumber,
    Internal_Permit_Link: req.body.internalPermitLink,
  };
  db.collection("todos")
    .insertOne(formData)
    .then((result) => {
      console.log("Form Data Added");
      response.redirect("/track");
    })
    .catch((error) => console.error(error));
});

app.post("/register", async (req, res) => {
  try {
    const domains = await db.collection("domain_whitelist").find().toArray();
    const requestedDomain = req.body.email.split("@");

    if (
      domains.some((item) => {
        return item.domain === requestedDomain[1];
      })
    ) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const formData = {
        Email: req.body.email,
        Password: hashedPassword,
      };
      db.collection("users")
        .insertOne(formData)
        .then((result) => {
          const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
            expiresIn: "1d",
          });
          res.cookie("token", token);
          res.redirect("/home");
        })
        .catch((error) => console.error(error));
    } else {
      throw new Error("Access deny, your email is not matched with required domains.");
    }
  } catch (error) {
    res.render("error.ejs", { errorMessage: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const domains = await db.collection("domain_whitelist").find().toArray();
    const requestedDomain = req.body.email.split("@");

    if (
      domains.some((item) => {
        return item.domain === requestedDomain[1];
      })
    ) {
      const user = await db.collection("users").findOne({ Email: req.body.email });
      if (!user) {
        throw new Error("User not found.");
      } else if (await bcrypt.compare(req.body.password, user.Password)) {
        const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        res.cookie("token", token);
        res.redirect("/home");
      } else {
        throw new Error("Invalid password.");
      }
    } else {
      throw new Error("Access deny, your email is not matched with required domains.");
    }
  } catch (error) {
    res.render("error.ejs", { errorMessage: error.message });
  }
});

// app.put('/markComplete', (request, response) => {
//     db.collection('todos').updateOne({things: request.body.itemFromJS},{
//         $set: {
//             completed: true
//           }
//     },{
//         sort: {_id: -1},
//         upsert: false
//     })
//     .then(result => {
//         console.log('Marked Complete')
//         response.json('Marked Complete')
//     })
//     .catch(error => console.error(error))

// })

// app.put('/markUnComplete', (request, response) => {
//     db.collection('todos').updateOne({things: request.body.itemFromJS},{
//         $set: {
//             completed: false
//           }
//     },{
//         sort: {_id: -1},
//         upsert: false
//     })
//     .then(result => {
//         console.log('Marked Complete')
//         response.json('Marked Complete')
//     })
//     .catch(error => console.error(error))

// })

// app.delete('/deleteItem', (request, response) => {
//     db.collection('todos').deleteOne({things: request.body.itemFromJS})
//     .then(result => {
//         console.log('Todo Deleted')
//         response.json('Todo Deleted')
//     })
//     .catch(error => console.error(error))

// })

app.listen(process.env.PORT || PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
