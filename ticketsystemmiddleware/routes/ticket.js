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
    assigned_collaborators: {
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
    resolved_at: {
        type: DataTypes.STRING,
    },
    resolved_by: {
        type: DataTypes.STRING,
    },
    is_notified: {
        type: DataTypes.STRING,
    },
    is_active: {
        type: DataTypes.STRING,
    },
    is_reviewed: {
        type: DataTypes.STRING,
    },
    ticket_for: {
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
    const currentTimestamp = new Date();
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
            assigned_location,
            created_by
        } = req.body;

        let attachmentPath = null;
        if (req.files && req.files.length > 0) {
            attachmentPath = req.files.map(file => file.path).join(';'); // Save multiple paths separated by ;
        }

        const [createTicket] = await knex('ticket_master').insert({
            ticket_subject,
            ticket_type,
            ticket_status: 'open',
            ticket_urgencyLevel,
            ticket_category,
            ticket_SubCategory,
            ticket_for: created_by,
            assigned_location,
            asset_number,
            Description,
            created_by,
            created_at: currentTimestamp,
            Attachments: attachmentPath,
            is_active: true
        }).returning('ticket_id')

        const ticket_id = createTicket.ticket_id || createTicket;

        console.log('Created a ticket: ', ticket_id)

        await knex('ticket_logs').insert({
            ticket_id: ticket_id,
            ticket_status: 'open',
            ticket_subject,
            ticket_urgencyLevel,
            ticket_category,
            created_by,
            time_date: currentTimestamp,
            changes_made: `${created_by} submmited the ticket, Ticket ID: ${ticket_id}`
        })

        console.log('Created a ticket successfully by ' + `${created_by}`)
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
        console.log('triggered /get-all-tikcet')

    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})


router.post('/notified-true', async (req, res) => {
    try {
        const { ticket_id, user_id } = req.body;
        const empInfo = await knex('users_master').where('user_id', user_id).first();

        if (empInfo.emp_tier === 'tier1' ||
            empInfo.emp_tier === 'tier2' ||
            empInfo.emp_tier === 'tier3') {
            await knex('ticket_master').where({ ticket_id: ticket_id }).update({
                is_notified: true
            })
        } else if (empInfo.emp_tier === 'none') {
            await knex('ticket_master').where({ ticket_id: ticket_id }).update({
                is_notifiedhd: true
            })
        }

        console.log('Triggered /Update-notified-true')
        console.log('Notify ticket: ', ticket_id)
        res.status(200).json({ message: "Updated notif", ticket_id });
    } catch (err) {
        console.log(`Unable to update notification: `, err)
        res.status(500).json({ error: 'Failed to update notification' });
    }
})

router.post('/update-notified-false', async (req, res) => {
    try {
        const { ticket_id, user_id } = req.body;
        const empInfo = await knex('users_master').where('user_id', user_id).first();

        if (empInfo.emp_tier === 'tier1' ||
            empInfo.emp_tier === 'tier2' ||
            empInfo.emp_tier === 'tier3') {
            await knex('ticket_master').where({ ticket_id: ticket_id }).update({
                is_notifiedhd: false

            })
        } else if (empInfo.emp_tier === 'none') {
            await knex('ticket_master').where({ ticket_id: ticket_id }).update({
                is_notified: false
            })
        }

        console.log('Triggered /Update-notified-false')
        console.log('Un-Notify ticket: ', ticket_id)
        res.status(200).json({ message: "Updated notif", ticket_id });
    } catch (err) {
        console.log(`Unable to update notification: `, err)
    }
})

router.get('/ticket-by-id', async (req, res, next) => {
    try {
        const getById = await Tickets.findAll({
            where: {
                ticket_id: req.query.id
            }
        })
        console.log('triggered /ticket-by-id')
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
            updated_by,
            assigned_collaborators,
            ticket_for,
            changes_made
        } = req.body;


        let attachmentPath = null;

        if (req.files && req.files.length > 0) {
            // Fetch current attachment path from DB
            const existingTicket = await knex('ticket_master')
                .select('Attachments')
                .where('ticket_id', ticket_id)
                .first();

            if (existingTicket && existingTicket.Attachments) {
                const oldPaths = existingTicket.Attachments.split(',');
                for (const oldPath of oldPaths) {
                    const fullPath = path.join(__dirname, '..', oldPath);
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.error(`Error deleting file ${fullPath}:`, err.message);
                        } else {
                            console.log(`Deleted old attachment: ${fullPath}`);
                        }
                    });
                }
            }

            // Replace with new uploaded file paths
            attachmentPath = req.files.map(file => file.path.replace(/\\/g, '/')).join(',');
        } else if (req.body.Attachments) {
            // No new file, retain old one
            attachmentPath = req.body.Attachments;
        }

        if (req.files && req.files.length > 0) {
            attachmentPath = req.files.map(file => file.path.replace(/\\/g, '/')).join(',');
        } else if (req.body.Attachments) {
            attachmentPath = req.body.Attachments;
        }

        if (ticket_status === 'open') {
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
            assigned_collaborators,
            ticket_for,
            updated_at: currentTimestamp,
            updated_by
        });

        if (ticket_status === 'resolved') {
            await knex('ticket_master').where('ticket_id', ticket_id).update({
                resolved_at: currentTimestamp,
                resolved_by: updated_by
            })
        }
        if (ticket_status === 're-opened') {
            await knex('ticket_master').where('ticket_id', ticket_id).update({
                is_reviewed: false
            })
        }

        await knex('ticket_logs').insert({
            ticket_id,
            ticket_status,
            ticket_subject,
            ticket_urgencyLevel,
            ticket_category: ticket_category,
            created_by: updated_by,
            time_date: currentTimestamp,
            changes_made
        });

        console.log(`Ticket ${ticket_id} was updated by ${updated_by} `)
        res.status(200).json({ message: 'Ticket updated successfully' });
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/update-accept-ticket', async (req, res, next) => {
    const currentTimestamp = new Date()

    try {
        const { user_id, ticket_id, ticket_status } = req.body
        const empInfo = await knex('users_master').where('user_id', user_id).first();
        const ticketInfo = await knex('ticket_master').where('ticket_id', ticket_id).first();
        console.log('EMPOINFO CONMSOLE:', empInfo)

        if (ticket_status === 'closed') {
            console.log('CLOSED TICKET');
            const closed = await knex('ticket_master').where('ticket_id', ticket_id).update({
                assigned_to: empInfo.user_name,
                assigned_group: empInfo.emp_tier,
                updated_at: currentTimestamp,
                responded_at: currentTimestamp,
                ticket_status: 're-opened',
                is_reviewed: false
            })

            await knex('ticket_logs').insert({
                ticket_id,
                ticket_status,
                ticket_subject: ticketInfo.ticket_subject,
                ticket_urgencyLevel: ticketInfo.ticket_urgencyLevel,
                ticket_category: ticketInfo.ticket_category,
                created_by: empInfo.user_name,
                time_date: currentTimestamp,
                changes_made: `${empInfo.user_name} accepted closed ticket and re-opened the ticket, Ticket ID: ${ticket_id}`
            })
            console.log('Closed: ', closed)
        } else {
            const notclosed = await knex('ticket_master').where('ticket_id', ticket_id).update({
                assigned_to: empInfo.user_name,
                assigned_group: empInfo.emp_tier,
                updated_at: currentTimestamp,
                responded_at: currentTimestamp,
                ticket_status: 'assigned'
            })
            console.log('NOT CLOSED: ', notclosed)
        }

        if (ticket_status === 'open') {
            await knex('ticket_logs').insert({
                ticket_id,
                ticket_status,
                ticket_subject: ticketInfo.ticket_subject,
                ticket_urgencyLevel: ticketInfo.ticket_urgencyLevel,
                ticket_category: ticketInfo.ticket_category,
                created_by: empInfo.user_name,
                time_date: currentTimestamp,
                changes_made: `${empInfo.user_name} accepted open ticket and was assigned ,Ticket ID: ${ticket_id}`
            })
        }
        if (ticket_status === 'escalate2') {
            await knex('ticket_logs').insert({
                ticket_id,
                ticket_status,
                ticket_subject: ticketInfo.ticket_subject,
                ticket_urgencyLevel: ticketInfo.ticket_urgencyLevel,
                ticket_category: ticketInfo.ticket_category,
                created_by: empInfo.user_name,
                time_date: currentTimestamp,
                changes_made: `${empInfo.user_name} accepted escalate2 ticket and was assigned, Ticket ID: ${ticket_id}`
            })
        }
        if (ticket_status === 'escalate3') {
            await knex('ticket_logs').insert({
                ticket_id,
                ticket_status,
                ticket_subject: ticketInfo.ticket_subject,
                ticket_urgencyLevel: ticketInfo.ticket_urgencyLevel,
                ticket_category: ticketInfo.ticket_category,
                created_by: empInfo.user_name,
                time_date: currentTimestamp,
                changes_made: `${empInfo.user_name} accepted escalate3 ticket and was assigned, Ticket ID: ${ticket_id}`
            })
        }
        if (ticket_status === 'resolved') {
            await knex('ticket_logs').insert({
                ticket_id,
                ticket_status,
                ticket_subject: ticketInfo.ticket_subject,
                ticket_urgencyLevel: ticketInfo.ticket_urgencyLevel,
                ticket_category: ticketInfo.ticket_category,
                created_by: empInfo.user_name,
                time_date: currentTimestamp,
                changes_made: `${empInfo.user_name} accepted resolved ticket and was assigned, Ticket ID: ${ticket_id}`
            })
        }
        console.log(`Ticket ${ticket_id} was successfully accepted by ${empInfo.user_name}`)
    } catch (err) {
        console.log('Update Accept console: ', err)
    }

})

router.post('/note-post', async (req, res, next) => {
    const currentTimestamp = new Date()

    try {
        const {
            notes,
            current_user,
            ticket_id
        } = req.body;
        await knex('notes_master').insert({
            note: notes,
            created_by: current_user,
            created_at: currentTimestamp,
            ticket_id: ticket_id
        })
        console.log(`${current_user} placed a note successfully`)
        res.status(200).json({ message: 'PLaced a note successfully' });
    } catch (err) {
        console.log('Internal Error: ', err)
    }
})

router.get('/get-all-notes/:ticket_id', async (req, res, next) => {
    try {
        const ticket_id = req.params.ticket_id;
        const notes = await knex('notes_master').where({ ticket_id })
            .orderBy('created_at', 'created_by, note');
        res.json(notes);
        console.log('triggered /get-all-notes/:ticket_id');
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})
router.get('/get-all-feedback/:ticket_id', async (req, res) => {
    try {
        const ticket_id = req.params.ticket_id;
        const feedback = await knex('review_master').where({ ticket_id })
            .orderBy('created_at', 'user_id', 'review');
        res.json(feedback);
        console.log('triggered /get-all-feedback/:ticket_id');
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})

router.post('/feedback', async (req, res) => {
    const currentTimestamp = new Date();
    try {

        const { review, user_id, created_by, ticket_id } = req.body;

        await knex('review_master').insert({
            review,
            user_id,
            created_at: currentTimestamp,
            created_by,
            ticket_id
        })
        await knex('ticket_master').where({ ticket_id: ticket_id }).update({
            is_reviewed: true
        });
        res.json(200);
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})
module.exports = router;