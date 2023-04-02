const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 4141
require('dotenv').config()
console.log(process.env.DB_STRING)



let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
    
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
// app.get('/',async (request, response)=>{
//     const todoItems = await db.collection('todos').find().toArray()
//     const itemsLeft = await db.collection('todos').countDocuments({completed: false})
//     response.render('index.ejs', { items: todoItems, left: itemsLeft })
    
// })

app.get("/", async (req, res) => {
    res.render("index2.ejs");
});
        
app.get("/track", async (req, res) => {
    const formdata= await db.collection('todos').find().toArray()
    res.render("index3.ejs", { formdata: formdata });
});
app.get("/addpermit", async (req, res) => {
    
    const formdata= await db.collection('todos').find().toArray()
    res.render("index.ejs", { formdata: formdata });
}); 

app.post('/edit/:id', (req, response) => {
    var ObjectID = require('mongodb').ObjectID
    const r_id = req.params.id;
    const final_id = new ObjectID(r_id)
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
    db.collection('todos').updateOne(
        {"_id" : final_id},
        {$set: formData})
    .then(result => {
        console.log('Form Data changed')
        response.redirect('/track')
    })
    .catch(error => console.error(error))
})

app.get("/edit/:id", async (req, res) => {
    var ObjectID = require('mongodb').ObjectID
    const r_id = req.params.id;
    const final_id = new ObjectID(r_id)
    const formdata= await db.collection('todos').findOne({_id: final_id})
    res.render("index4.ejs", { formdata: formdata });   
})




// app.post('/addTodo', (request, response) => {
//     db.collection('todos').insertOne({formdata: request.body.formdata, completed: false})
//     .then(result => {
//         console.log('Todo Added')
//         response.redirect('/')
//     })
//     .catch(error => console.error(error))
// })


app.post('/addpermit', (req, response) => {
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
    db.collection('todos').insertOne(formData)
    .then(result => {
        console.log('Form Data Added')
        response.redirect('/track')
    })
    .catch(error => console.error(error))
})

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

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})