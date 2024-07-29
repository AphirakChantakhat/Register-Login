import express, { response } from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import bycrypt, { hash } from 'bcrypt'

import bodyParser from 'body-parser'
import axios from 'axios'
const app = express()

app.use(express.json())
app.use(cors())
app.use(bodyParser.json());

const LINE_NOTIFY_TOKEN = '3ubQ4j1XrrJ09XLcTnzjTXIhnty1ZP88WaQ7A0Tt7LS';

const db = mysql.createConnection({
    host: "localhost",
    port: 3306,
    database: "db",
    user: "root",
    password: "1234"
})
db.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL database:', error);
    } else {
        console.log('Connected to MySQL database!');
    }
});


const salt = 5;
app.post("/register", (req, res) =>{
    const sql = "INSERT INTO user (`username`, `email`, `password`) VALUES (?)";
    bycrypt.hash(req.body.password.toString(), salt, (err, hash) =>{
        if(err) return res.json("Error")
        const values = [req.body.username, req.body.email,hash]
        db.query(sql,[values], (err, result) => {
            if(err){
                console.log(err);
            }else
                return res.json(result)
        })
    })
})
app.post("/login", (req, res) =>{
    const sql = "SELECT * FROM user WHERE `email` = ?";
    db.query(sql,[req.body.email], (err, result) =>{
        if(err) return res.json({Error: "Error"})
        else{
            if(result.length > 0){
                bycrypt.compare(req.body.password.toString(), result[0].password,(err, response) => {
                    if(err) return res.json({Error: "Error"})
                    if(response) return res.json({Status: "Success"})
                    else return res.json({Error: "weong password"})
                })
            }else{
                return res.json({Error: "email not existing"})
            }
        }
    })
})
app.post('/webhook', (req, res) => {
    console.log('Webhook received:', req.body);

    const message = 'นาย A ได้รับประสบอุบัติเหตุที่ : https://www.google.co.th/maps/place/19.027314407192602,99.90033036940376';

    axios.post('https://notify-api.line.me/api/notify', `message=${message}`, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${LINE_NOTIFY_TOKEN}`
        }
    })
    .then(response => {
        console.log('Notification sent:', response.data);
        res.sendStatus(200);
    })
    .catch(error => {
        console.error('Error sending notification:', error);
        res.sendStatus(500);
    });
});

app.listen(8081, ()=>{
    console.log("listening")
})