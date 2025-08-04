var express = require('express');
var bcrypt = require('bcrypt');
const router = express.Router();
var Sequelize = require('sequelize');

require('dotenv').config();

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

const { DataTypes } = Sequelize;

const Announcement = db.define('users_master', {
    announcements_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    announcements: {
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.STRING
    },
    updated_by: {
        type: DataTypes.STRING
    },
    updated_at: {
        type: DataTypes.STRING
    },
}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'users_master'
});

router.post('/add-anc', async (req, res) => {
    const currentTimestamp = new Date();
    const { announcements, created_by } = req.body;

    try {
        const [add] = await knex('announcements_master').insert({
            announcements,
            created_by,
            created_at: currentTimestamp
        }).returning('announcements_id');

        const announcement_id = add.announcements_id || add;

        await knex('announcements_logs').insert({
            announcements_id: announcement_id,
            changes_made: `${created_by} has added an announcement.`,
            created_at: currentTimestamp,
            created_by: created_by
        })

        res.json(200);
        console.log('triggered /add-anc')

    } catch (err) {
        console.log('INTERNAL ERROR UNABLE TO PUT ANNOUNCEMENT: ', err)
    }

});

router.get('/get-all-anc', async (req, res) => {
    try {
        const fetchall = await knex('announcements_master').select('*');
        res.json(fetchall);
        console.log('triggered /get-all-anc')
    } catch (err) {
        console.log('INTERNAL ERROR UNABLE TO FETCH ALL ANC: ', err)
    }
})

router.post('/update-anc', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            announcement_id,
            announcements,
            updated_by
        } = req.body;

        const oldanc = await knex('announcements_master').where({ announcements_id: announcement_id }).first();

        await knex('announcements_master').where({ announcements_id: announcement_id }).update({
            updated_at: currentTimestamp,
            announcements,
            updated_by
        })

        await knex('announcements_logs').insert({
            announcements_id: announcement_id,
            changes_made: `${updated_by} has edited announcement. OLD:${oldanc.announcements} to NEW:${announcements}`,
            created_at: currentTimestamp,
            created_by: updated_by
        })

        res.json(200);
        console.log('triggered /update-anc')
    } catch (err) {
        console.log("INTERNAL ERROR UNABLE TO UPDATE: ", err)
    }
})


router.post('/delete-anc', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const { announcement_id, updated_by } = req.body;

        await knex('announcements_master').where({ announcements_id: announcement_id }).update({
            is_active: 0,
            updated_at: currentTimestamp,
            updated_by: updated_by

        })
        await knex('announcements_logs').insert({
            announcements_id: announcement_id,
            changes_made: `${updated_by} has deleted announcement.`,
            created_at: currentTimestamp,
            created_by: updated_by
        })
        res.json(200);
        console.log('triggered /delete-anc')
    } catch (err) {
        console.log("INTERNAL ERROR UNABLE TO DELETE: ", err)
    }
})


module.exports = router;