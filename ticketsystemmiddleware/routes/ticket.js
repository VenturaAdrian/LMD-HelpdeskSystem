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
const { assign } = require('nodemailer/lib/shared');


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

var db = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
    host: process.env.SERVER,
    dialect: "mssql",
    port: parseInt(process.env.APP_SERVER_PORT),
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

const { DataTypes } = Sequelize;

const Tickets = db.define('ticket_master', {
    ticket_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    ticket_subject: {
        type: DataTypes.STRING,
    },
    ticket_type: {
        type: DataTypes.STRING,
    },
    ticket_status: {
        type: DataTypes.STRING,
    },
    ticket_urgencyLevel: {
        type: DataTypes.STRING,
    },
    ticket_category: {
        type: DataTypes.STRING,
    },
    ticket_SubCategory: {
        type: DataTypes.STRING,
    },
    assigned_to: {
        type: DataTypes.STRING,
    },
    assigned_group: {
        type: DataTypes.STRING,
    },
    asset_number: {
        type: DataTypes.STRING,
    },
    Attachments: {
        type: DataTypes.STRING,
    },
    Description: {
        type: DataTypes.STRING,
    },
    responded_at: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.STRING,
    },
    created_by: {
        type: DataTypes.STRING,
    },
    updated_at: {
        type: DataTypes.STRING,
    },
    updated_by: {
        type: DataTypes.STRING,
    },

}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'ticket_master'
})


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
            ticket_status: 'open',
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

router.get('/ticket-by-id', async (req, res, next) => {
    try {
        const getById = await Tickets.findAll({
            where: {
                ticket_id: req.query.id
            }
        })
        console.log(getById);
        res.json(getById[0])
    } catch (err) {
        console.error('Error fetching getbyid internal:', err);
        res.status(500).json({ error: 'Failed to fetch ticketbyid' });
    }
})

router.post('/update-ticket', upload.array('attachments'), async (req, res) => {
    console.log('UPDATE TICKET BODY: ', req.body);
    const currentTimestamp = new Date()
    try {
        const {
            ticket_id,
            ticket_subject,
            ticket_type,
            ticket_status,
            ticket_urgencyLevel,
            Description,
            ticket_category,
            ticket_SubCategory,
        } = req.body;

        let attachmentPath = null;
        if (req.files && req.files.length > 0) {
            attachmentPath = req.files.map(file => file.path.replace(/\\/g, '/')).join(',');
        } else if (req.body.Attachments) {
            attachmentPath = req.body.Attachments;
        }

        if (ticket_status === 'open' || ticket_status === 'escalate') {
            await knex('ticket_master').where('ticket_id', ticket_id).update({
                assigned_to: '',
                assigned_group: ''
            })
        }

        await knex('ticket_master').where('ticket_id', ticket_id).update({
            ticket_subject,
            ticket_type,
            ticket_status,
            ticket_urgencyLevel,
            ticket_category,
            ticket_SubCategory,
            Attachments: attachmentPath,
            Description,
            updated_at: currentTimestamp
        });

        res.status(200).json({ message: 'Ticket updated successfully' });
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/update-accept-ticket', async (req, res, next) => {
    const currentTimestamp = new Date()

    try {
        const { user_id, ticket_id } = req.body
        const empInfo = await knex('users_master').where('user_id', user_id).first();
        console.log('EMPOINFO CONMSOLE:', empInfo)

        await knex('ticket_master').where('ticket_id', ticket_id).update({
            assigned_to: empInfo.user_name,
            assigned_group: empInfo.emp_tier,
            updated_at: currentTimestamp,
            responded_at: currentTimestamp,
            ticket_status: 'assigned'
        })


    } catch (err) {
        console.log(err)
    }

})


module.exports = router;