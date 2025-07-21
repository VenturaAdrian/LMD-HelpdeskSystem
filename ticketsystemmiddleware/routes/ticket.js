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

const DIR = './uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: function (req, file, cb) {
        const original = file.originalname.replace(/\s+/g, '_');
        const uniqueName = `${new Date().toISOString().replace(/[:.]/g, '-')}_${original}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 } // 200 MB
});



router.post('/create-ticket', upload.array('Attachments'), async (req, res) => {
    try {
        const {
            ticket_subject,
            ticket_type,
            ticket_status,
            ticket_urgencyLevel,
            ticket_category,
            ticket_SubCategory,
            asset_number,
            Description,
            created_by
        } = req.body;

        let attachmentPath = null;
        if (req.files && req.files.length > 0) {
            attachmentPath = req.files.map(file => file.path).join(';'); // Save multiple paths separated by ;
        }

        await knex('ticket_master').insert({
            ticket_subject,
            ticket_type,
            ticket_status,
            ticket_urgencyLevel,
            ticket_category,
            ticket_SubCategory,
            asset_number,
            Description,
            created_by,
            Attachments: attachmentPath
        });

        res.status(200).json({ message: 'Ticket created successfully' });
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/get-all-ticket', async (req, res) => {
    try {
        const alltickets = await knex('ticket_master').select('*');
        res.json(alltickets)
        console.log('ALL TICKETS: ', alltickets)

    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})



module.exports = router;