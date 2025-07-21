var express = require('express');
var bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const router = express.Router();
var Sequelize = require('sequelize');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');               
const fsp = require('fs/promises');
const { type } = require('os');
require('dotenv').config();
const archiver = require('archiver');


    var knex = require("knex")({
        client: 'mssql',
        connection: {
        user: process.env.USER,
        password: process.env.PASSWORD,
        server: process.env.SERVER,
        database: process.env.DATABASE,
        port: parseInt(process.env.APP_SERVER_PORT),
        options: {
            enableArithAbort: true,
        
        }
        },
    });


      module.exports = router;