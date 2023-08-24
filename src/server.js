require("dotenv").config();
require("./db");

console.clear();

const express = require('express');
const app = express();
const cors = require('cors');
const { Employee } = require("./model/Employee");
const port = 8080 || process.env.PORT;
const uuid = require('uuid').v4;
const path = require('path');
const multer = require('multer');
const storagePath = "storage/";

/* Upload Config */
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, storagePath);
    },
    filename: function (req, file, callback) {
        callback(null, uuid()+"_"+file.originalname);
    }
});
const upload = multer({storage: storage, limits: { fileSize: 548576 }}).single("document");

/* Middlewares */
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());
app.use("/storage", express.static('storage'));

app.get('/', async(req, res) => {
    const query = req.query.q;
    const queryRegex = {$regex: new RegExp(query + "$", "i")};
    
    const filterEmpStatus = req.query.empStatus == ""?/^.*/:new RegExp(req.query.empStatus, "i");
    console.log(`Filters: [empStatus=${filterEmpStatus}]`);

    let data = await Employee.find({$and: [{empStatus: filterEmpStatus}], $or: [{firstname: queryRegex}, {lastname: queryRegex}, {department: queryRegex}, {id: queryRegex}]});
    res.json({status: 1, data: data});
});

app.post('/', async(req, res) => {

    upload(req, res, async function (err) {
        if (err) {
            res.status(400).json({status: 0, text: "File upload error", errors: { document: "File size exceeds 5 MB" }});
            return;
        }

        let emp = await Employee.findOne({id: req.body.id});
        if(emp != null) {
            console.log(emp);
            res.status(400).json({status: 0, text: "", errors: {id: "Employee with given ID already exists."}});
            return;
        }

        emp = new Employee(req.body);
        if(req.file) emp.documentURL = `${storagePath}${req.file.filename}`;
        
        try {
            await emp.save();
            res.status(201).json({status: 1, text: "Created.", errors: {}});
        } catch(error) {

            let errors = {};
            if (error.name === "ValidationError") {
                Object.keys(error.errors).forEach((key) => {
                errors[key] = error.errors[key].message;
                });
            }

            res.status(400).json({status: 0, text: "Incomplete data provided.", errors});
        }

        return;
    });
});

app.listen(port, async() => {
    console.log(`Server up and running at http://localhost:${port}/`);
});