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

router.post('/add-knowledgebase', async (req, res) => {
    try {
        const {
            kb_title,
            kb_desc,
            kb_category,
            created_by,
        } = req.body;

        const currentTimestamp = new Date();

        const [add] = await knex('knowledgebase_master').insert({
            kb_title,
            kb_desc,
            kb_category,
            created_by,
            created_at: currentTimestamp,
        })
            .returning('kb_id');
        const kd_id = add.kb_id || add;

        res.json(200);
        console.log('Triggered add-knowledgebase route');
    } catch (err) {
        console.error('INTERNAL ERROR :', err);
    }
})

router.get('/all-knowledgebase', async (req, res) => {
    try {
        const knowledgebase = await knex('knowledgebase_master').select('*');
        res.json(knowledgebase);
    } catch (err) {
        console.error('Error fetching knowledgebase:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})





module.exports = router;