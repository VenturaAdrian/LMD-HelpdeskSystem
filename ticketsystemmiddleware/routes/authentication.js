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

const Users1 = db.define('users_master', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  user_name: {
    type: DataTypes.STRING
  },
  emp_position: {
    type: DataTypes.STRING
  },
  emp_department: {
    type: DataTypes.STRING
  },
  emp_FirstName: {
    type: DataTypes.STRING
  },
  emp_LastName: {
    type: DataTypes.STRING
  },
  emp_email: {
    type: DataTypes.STRING
  },
  emp_role: {
    type: DataTypes.STRING
  },
  emp_tier: {
    type: DataTypes.STRING
  },
  pass_word: {
    type: DataTypes.STRING
  },
  created_by: {
    type: DataTypes.STRING
  },
  created_at: {
    type: DataTypes.STRING
  },
  is_active: {
    type: DataTypes.STRING
  },

}, {
  freezeTableName: false,
  timestamps: false,
  createdAt: false,
  updatedAt: false,
  tableName: 'users_master'
})

router.get('/login', async function (req, res, next) {
  console.log(Users1)
  try {
    const user = await Users1.findAll({
      where: {
        user_name: req.query.user_name
      }
    });

    if (!user || user.length === 0) {
      console.log('USER NOT FOUND')
      return res.status(404).json({ msg: 'User not found! Try again...' })
    }

    if (req.query.pass_word !== user[0].pass_word) {
      console.log('INCORRECT PASSWORD')
      return res.status(401).json({ msg: 'Incorrect password. Try again...' })
    }

    console.log('USE RESULTS:', user[0])


    await knex('users_master')
      .where({ user_id: user[0].user_id })
      .update({ is_active: 1 });

    const result = {
      user_id: user[0].user_id,
      user_name: user[0].user_name,
      emp_department: user[0].emp_department,
      emp_position: user[0].emp_position,
      emp_email: user[0].emp_email,
      emp_FirstName: user[0].emp_FirstName,
      emp_LastName: user[0].emp_LastName,
      is_active: user[0].is_active,
      emp_role: user[0].emp_role,
      emp_tier: user[0].emp_tier,
    };

    console.log(`User ${user[0].user_name} Logged In`);
    res.json(result);
  } catch (err) {
    console.log("Error logging in: ", err)
    return res.status(404).json({ msg: 'User not found! Try again...' })

  }
})

router.post('/register', async function (req, res, next) {
  const currentTimestamp = new Date();
  const {
    emp_firstname,
    emp_lastname,
    user_name,
    pass_word,
    emp_email,
    emp_tier,
    emp_role,
    emp_phone,
    emp_department,
    emp_position,
    current_user
  } = req.body

  try {
    await knex('users_master').insert({
      emp_FirstName: emp_firstname,
      emp_LastName: emp_lastname,
      user_name: user_name,
      pass_word: pass_word,
      emp_email: emp_email,
      emp_tier: emp_tier,
      emp_role: emp_role,
      emp_phone: emp_phone,
      emp_department: emp_department,
      emp_position: emp_position,
      created_by: current_user,
      created_at: currentTimestamp,
      is_active: 1
    })
    console.log(`User was registered ${user_name} by ${current_user}`);
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(404).json({ msg: 'Unable to Register user!' + ` ${user_name}` })

  }
})

router.get('/get-all-users', async (req, res, next) => {
  try {
    const getAllUsers = await knex('users_master').select('*');
    res.json(getAllUsers)
    console.log('Triggered /get-all-users')
  } catch (err) {
    console.log('Unable to fetch all users');

  }
})

router.get('/get-by-username', async (req, res, next) => {
  try {
    const getCreatedBy = await Users1.findAll({
      where: {
        user_name: req.query.user_name
      }
    })
    res.json(getCreatedBy[0])
  } catch (err) {
    console.log('GET BY USERNAME CONOSOLE: ', err)
  }
})
router.get('/get-by-id', async (req, res, next) => {
  try {
    const getCreatedBy = await Users1.findAll({
      where: {
        user_id: req.query.user_id
      }
    })
    res.json(getCreatedBy[0])
  } catch (err) {
    console.log('GET BY USERNAME CONOSOLE: ', err)
  }
})

const { Op } = require('sequelize');

router.get('/get-all-notes-usernames', async (req, res) => {
  try {
    const usernames = JSON.parse(req.query.user_name); // Convert string back to array
    const users = await Users1.findAll({
      where: {
        user_name: { [Op.in]: usernames }
      }
    });
    res.json(users);
    console.log(users)
  } catch (err) {
    console.error('Error fetching multiple users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/get-all-by-id', async (req, res) => {
  try {
    const user_id = JSON.parse(req.query.user_id); // Convert string back to array
    const users = await Users1.findAll({
      where: {
        user_id: { [Op.in]: user_id }
      }
    });
    res.json(users);
    console.log(users)
  } catch (err) {
    console.error('Error fetching multiple users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


router.get('/get-all-notes', async (req, res) => {
  try {
    const getAll = await knex('notes_master').select('*');
    res.json(getAll)
  } catch (err) {
    console.log('INTERNAL ERROR: ', err)
  }
})



module.exports = router;