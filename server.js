const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const PORT = 4141;
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const { auth, adminAuth } = require("./auth.middleware");
const jwtDecode = require("jwt-decode");
const { sendEmail } = require("./utilities");
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
  const token = req.cookies?.token;
  if ((token && jwtDecode(token).exp < Date.now() / 1000) || !token) {
    res.render("index5.ejs");
  } else {
    res.redirect("/home");
  }
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

app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const domains = await db.collection("domain_whitelist").find().toArray();
    const requestedDomain = email.split("@");

    if (
      domains.some((item) => {
        return item.domain === requestedDomain[1];
      })
    ) {
      const user = await db.collection("users").findOne({ Email: email, Type: "user" });
      await sendEmail(email, db, user);
      res.render("verify-code.ejs", { email: email });
    } else {
      throw new Error("Access deny, your email is not matched with required domains.");
    }
  } catch (error) {
    res.render("error.ejs", { errorMessage: error.message });
  }
});

app.get("/admin-login", async (req, res) => {
  const token = req.cookies?.token;
  if ((token && jwtDecode(token).exp < Date.now() / 1000) || !token) {
    res.render("index7.ejs");
  } else {
    res.redirect("/add-email-domains");
  }
});

app.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.collection("users").findOne({ Email: email, Type: "admin" });
    console.log("admin user =>", user);
    if (!user) {
      throw new Error("User not found.");
    } else if (password === user.Password) {
      const token = jwt.sign({ email: user.Email, type: user.Type }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      console.log("admin token =>", token);
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: "strict",
        path: "/",
      });
      console.log("set cookie =>", token);
      res.redirect("/add-email-domains");
    } else {
      throw new Error("Invalid password.");
    }
  } catch (error) {
    console.log("admin error =>", error);
    res.render("admin-error.ejs", { errorMessage: error.message });
  }
});

app.get("/add-email-domains", adminAuth, async (req, res) => {
  res.render("index6.ejs");
});

app.post("/add-email-domains", adminAuth, async (req, res) => {
  try {
    const domains = req.body.email_domain.split(",");
    const domainsInserted = Promise.all(
      domains.map(async (domain) => {
        const isDomainAvailable = await db
          .collection("domain_whitelist")
          .findOne({ domain: domain.trim() });
        if (!isDomainAvailable) {
          await db
            .collection("domain_whitelist")
            .insertOne({ domain: domain.trim() })
            .then((result) => {
              console.log("Domain Inserted", domain.trim());
            });
        }
      })
    );
    domainsInserted.then(() => {
      res.render("success.ejs", { successMessage: "Email domains inserted successfully." });
    });
  } catch (error) {
    console.error("error");
  }
});

app.post("/verify-code", async (req, res) => {
  try {
    const { email, verification_code } = req.body;
    const user = await db.collection("users").findOne({ Email: email });
    console.log("user =>", user);

    if (user.VerificationCode !== parseInt(verification_code)) {
      throw new Error("Invalid verification code, please try again.");
    }

    await db.collection("users").updateOne({ _id: user._id }, { $unset: { VerificationCode: "" } });
    const token = jwt.sign({ email: user.Email, type: user.Type }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log("token =>", token);
    res.cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: "strict",
      path: "/",
    });
    console.log("set cookie =>", token);
    res.redirect("/home");
  } catch (error) {
    console.log("error =>", error);
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
