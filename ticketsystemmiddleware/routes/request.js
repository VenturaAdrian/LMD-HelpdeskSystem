var express = require('express');
var bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const router = express.Router();
var Sequelize = require('sequelize');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');                // <== Needed for fs.existsSync
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

    router.post('/register', async function (req, res, next){
  
  const currentTimestamp = new Date(); //Current time - YYYY/MM/DD - 00/HH/MM/SSS

    console.log(req)
      const {
        emp_firstname,
        emp_lastname,
        user_name,
        emp_email,
        emp_position,
        pass_word,
        emp_role,
        updated_by,
        first_name,
        last_name
      } = req.body;

      

    try{
      const [user] = await knex('users_master'). insert({
          emp_firstname: emp_firstname,
          emp_lastname: emp_lastname,
          emp_email: emp_email,
          user_name: user_name,
          emp_position: emp_position,
          pass_word:pass_word,
          emp_role: emp_role,
          created_by: updated_by,
          created_at: currentTimestamp,
          updated_by: '',
          updated_at: currentTimestamp, 
          is_active: 0
          
        }).returning('id_master')

        const id_master = user.id_master || user;

        await knex('users_logs').insert({
          user_id: id_master,
          emp_firstname: emp_firstname,
          emp_lastname: emp_lastname,
          updated_by: updated_by,
          time_date: currentTimestamp,
          changes_made: first_name+ ' '+ last_name + ' registered '+ user_name
        })
        
      console.log('User registered');
       res.status(200).json({ message: "User registered successfully" });

    }catch(err){
          console.error("Registration error:", err); // show actual error
      res.status(500).json({ error: "Registration failed", details: err.message });
      }
  });

router.get('/useredit', async (req,res,next)=> {
  try{
    const getUser = await Users.findAll({
      where:{
        id_master: req.query.id
      }
    })
    console.log(getUser)
    res.json(getUser[0]);
  }catch(err){
    console.error('Error fetching user data', err);
    res.status(500).json({error: 'Failed to fetch request'});
  }
}) 



router.post('/update-user', async (req, res) => {
  const currentTimestamp = new Date();

  try {
    const {
      id_master,
      emp_firstname,
      emp_lastname,
      user_name,
      emp_position,
      emp_role,
      pass_word,
      created_by,
      changes_log,
      is_active,
      emp_email
    } = req.body;

    // Update user data
    await knex('users_master').where({ id_master }).update({
      emp_firstname,
      emp_lastname,
      user_name,
      emp_position,
      emp_role,
      emp_email,
      pass_word,
      is_active,
      updated_by: created_by,
      updated_at: currentTimestamp
    });

    // Insert into users_logs with changes
    await knex('users_logs').insert({
      user_id: id_master,
      emp_firstname,
      emp_lastname,
      updated_by: created_by,
      time_date: currentTimestamp,
      changes_made: changes_log
    });

    res.status(200).json({ message: "Updated user", user_name });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});



    var db = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD,{
      host: process.env.SERVER,
      dialect: "mssql",
      port: parseInt(process.env.APP_SERVER_PORT),
    });  

    const { DataTypes } = Sequelize;
    
    const Requests = db.define('requests_master',{
        request_id:{
            type:DataTypes.INTEGER,
            primaryKey: true
        },
        request_status:{
            type:DataTypes.STRING,
        },
        comm_Area:{
            type:DataTypes.STRING,          
        },
        comm_Act:{
            type: DataTypes.STRING,
        },
        date_Time:{
            type: DataTypes.STRING,
        },
        comm_Venue:{ 
            type:DataTypes.STRING,
        },
        comm_Guest:{
            type:DataTypes.STRING,
        },
        comm_Docs:{
            type:DataTypes.STRING,
        },
        comm_Emps:{
            type:DataTypes.STRING,
        },
        comm_Benef:{
            type:DataTypes.STRING,
        },
        comrelofficer:{
          type:DataTypes.STRING,
        },
        comrelthree:{
          type:DataTypes.STRING,
        },
        comreldh:{
          type:DataTypes.STRING,
        },
        created_by:{
          type:DataTypes.STRING,
        },
        created_at:{
          type:DataTypes.STRING
        },
        comment_id:{
          type:DataTypes.STRING
        },
        is_active:{
          type:DataTypes.STRING,
        },
        comm_Desc:{
          type:DataTypes.STRING,
        },
        comm_Category:{
          type:DataTypes.STRING
        },
        created_at:{
          type:DataTypes.STRING
        }
        
    },{
        freezeTableName: false,
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        tableName: 'request_master'
    })

    //VIEW HISTORY
    router.get('/history', async(req,res,next)=>{
      try{
        const data = await knex('request_master').select('*'); 
        res.json(data)
        console.log(data)
        data.forEach(row => console.log(row.request_status));
      }catch(err){
        console.error('ERROR FETCHING:', err);
        res.status(500).json({error: 'Failed fetch data'})
        }
    });

    router.get('/request-logs', async(req,res,next) => {
        const getRequestLogs = await knex('request_logs').select('*');
        res.json(getRequestLogs)

    });


    const DIR = './uploads';

    const storage = multer.diskStorage({
        destination: (req,file,cb) => {
            cb(null,DIR);
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



router.get('/fetch-request-id', async (req, res) => {
  try {
    const data = await knex('request_master').select('*');
    res.json(data);
  } catch (err) {
    console.error('Error fetching all requests:', err);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
});    

router.get('/fetch-upload-id', async (req, res) => {
  try {
    const data = await knex('upload_master').select('*');
    res.json(data);
    
  } catch (err) {
    console.error('Error fetching all upload-id:', err);
    res.status(500).json({ message: 'Failed to fetch upload-id' });
  }
});    

router.post('/add-request-form', upload.array('comm_Docs'), async (req, res) => {
  const currentTimestamp = new Date();

  try {
    const {
      comm_Area,
      comm_Act,
      date_Time,
      comm_Venue,
      comm_Guest,
      comm_Emps,
      comm_Benef,
      created_by,
      comm_Desc,
      comm_Category
    } = req.body;

    let docFilename = [];

    const [newRequest] = await knex('request_master')
      .insert({
        request_status: 'request',
        comm_Area,
        comm_Act,
        date_Time,
        comm_Venue,
        comm_Guest,
        comm_Docs: '',
        comm_Emps,
        comm_Benef,
        comm_Desc,
        comm_Category,
        comment_id: '',
        comrelofficer: 0,
        comrelthree: 0,
        comreldh: 0,
        created_by,
        is_active: 1,
        created_at: currentTimestamp,
        updated_by: '',
        updated_at: currentTimestamp
      })
      .returning('request_id');

    const request_id = newRequest.request_id || newRequest; // for MSSQL compatibility

    let uploadIdToSave = [];

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const { mimetype, originalname, filename } = file;
        const filePath = path.join(DIR, filename);
        docFilename.push(filename);

        const [upload] = await knex('upload_master')
          .insert({
            request_id,
            upload_type: mimetype,
            file_path: filePath,
            file_name: originalname,
            upload_date: currentTimestamp,
            upload_by: created_by,
            updated_by: created_by,
            updated_at: currentTimestamp
          })
          .returning('upload_id');

        const upload_id = upload.upload_id || upload;
          uploadIdToSave.push(upload_id);
      }

      // 2. Update the request_master with file list + upload_id of first file
      await knex('request_master')
        .where({ request_id })
        .update({
          comm_Docs: docFilename.join(','),
          upload_id: uploadIdToSave.join(','),
          updated_at: currentTimestamp
        });
    }

    await knex('request_logs').insert({
      request_id: request_id,
      request_status: 'request' ,
      comm_Category,
      comm_Area,
      comm_Act,
      time_date: currentTimestamp,
      changes_made: `Request Id: ${request_id} was added by ${created_by}`
    })

    res.status(200).json({ message: 'Request added successfully', request_id, upload_id: uploadIdToSave });
  } catch (err) {
    console.error('Error in backend:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


    // FETCH ALL VALUES VIA REQUEST_ID
    router.get('/editform', async (req, res, next) => {
  try {
        const getRequest = await Requests.findAll({
            where:{
                request_id: req.query.id
            }
        })
        console.log(getRequest)
        res.json(getRequest[0]);
  }catch(err){
    console.error('Error fetching edit form data:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }

});


// Update Information Requests
router.post('/updateform', upload.array('comm_Docs'), async (req, res) => {
  try {
    const {
      request_id,
      request_status,
      comm_Area,
      comm_Act,
      date_Time,
      comm_Venue,
      comm_Guest,
      comm_Emps,
      comm_Benef,
      changes_made,
      comm_Category,
      comm_Desc,
      created_by,
    } = req.body;

    if (!request_id || !created_by) {
      return res.status(400).json({ error: "Missing request_id or created_by" });
    }

    const updatedByValue = Array.isArray(created_by) ? created_by[0] : String(created_by || 'Unknown');
    const currentTimestamp = new Date();
    const sanitizedCategory = comm_Category?.replace(/\s+/g, '_') || 'Uncategorized';

    const baseDir = path.join(DIR, sanitizedCategory, `request_${request_id}`);
    const galleryDir = path.join(baseDir, 'gallery');
    const filesDir = path.join(baseDir, 'files');

    const galleryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv'];
    const docFilenames = req.files?.map(file => file.filename) || [];

    const oldRequest = await knex('request_master').where({ request_id }).first();
    const oldCategory = oldRequest?.comm_Category?.replace(/\s+/g, '_') || 'Uncategorized';

    // STEP 1: Delete old files if new ones are uploaded
    if (docFilenames.length > 0) {
      if (oldRequest?.comm_Docs) {
        const oldFiles = oldRequest.comm_Docs.split(',').map(p => p.trim()).filter(Boolean);
        for (const fileRelPath of oldFiles) {
          const fullPath = path.join(DIR, fileRelPath);
          try {
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
              console.log(`Deleted old file: ${fullPath}`);
            }
          } catch (error) {
            console.error(`Failed to delete file ${fullPath}:`, error.message);
          }
        }
      }

      await knex('upload_master').where({ request_id }).del();

      await fsp.mkdir(galleryDir, { recursive: true });
      await fsp.mkdir(filesDir, { recursive: true });

      let newCommDocs = [];
      let uploadIdToSave = [];

      for (let file of req.files) {
        const { mimetype, originalname, filename, path: tempPath } = file;
        const ext = path.extname(filename).toLowerCase();
        const isGallery = galleryExtensions.includes(ext);
        const destFolder = isGallery ? galleryDir : filesDir;

        const newRelativePath = path.join(
          sanitizedCategory,
          `request_${request_id}`,
          isGallery ? 'gallery' : 'files',
          filename
        ).replace(/\\/g, '/');

        const destPath = path.join(destFolder, filename);
        await fsp.rename(tempPath, destPath);
      //Upload file to upload_master
        const [upload] = await knex('upload_master')
          .insert({
            request_id,
            upload_type: mimetype,
            file_path: path.join('uploads', newRelativePath).replace(/\\/g, '/'),
            file_name: originalname,
            upload_date: currentTimestamp,
            upload_by: updatedByValue,
            updated_by: updatedByValue,
            updated_at: currentTimestamp,
          })
          .returning('upload_id');

        const upload_id = upload.upload_id || upload;
        uploadIdToSave.push(upload_id);
        newCommDocs.push(newRelativePath);
      }

      await knex('request_master')
        .where({ request_id })
        .update({
          request_status,
          comm_Area,
          comm_Act,
          date_Time,
          comm_Venue,
          comm_Guest,
          comm_Docs: newCommDocs.join(','),
          upload_id: uploadIdToSave.join(','),
          comm_Emps,
          comm_Desc,
          comm_Category,
          comm_Benef,
          updated_by: updatedByValue,
          updated_at: currentTimestamp,
        });

        await knex('request_logs').insert({
      request_id,
      request_status,
      comm_Category,
      comm_Area,
      comm_Act,
      time_date: currentTimestamp,
      changes_made: changes_made
    })


    } else {
      if (oldCategory !== sanitizedCategory && oldRequest?.comm_Docs) {
        const oldDocPaths = oldRequest.comm_Docs.split(',').map(p => p.trim()).filter(Boolean);
        let updatedCommDocs = [];

        for (let oldRelPath of oldDocPaths) {
          const oldFullPath = path.join(DIR, oldRelPath);
          const filename = path.basename(oldRelPath);
          const ext = path.extname(filename).toLowerCase();
          const isGallery = galleryExtensions.includes(ext);

          const newRelativePath = path.join(
            sanitizedCategory,
            `request_${request_id}`,
            isGallery ? 'gallery' : 'files',
            filename
          ).replace(/\\/g, '/');

          const newFullPath = path.join(DIR, newRelativePath);

          await fsp.mkdir(path.dirname(newFullPath), { recursive: true });
          await fsp.rename(oldFullPath, newFullPath);
          updatedCommDocs.push(newRelativePath);

          await knex('upload_master')
            .where({ request_id })
            .andWhere('file_path', path.join('uploads', oldRelPath).replace(/\\/g, '/'))
            .update({
              file_path: path.join('uploads', newRelativePath).replace(/\\/g, '/'),
              updated_by: updatedByValue,
              updated_at: currentTimestamp
            });
        }

        await knex('request_master')
          .where({ request_id })
          .update({ comm_Docs: updatedCommDocs.join(',') });

        const oldFolder = path.join(DIR, oldCategory, `request_${request_id}`);
        if (fs.existsSync(oldFolder)) {
          try {
            await fsp.rm(oldFolder, { recursive: true, force: true });
            console.log(`Deleted old category folder: ${oldFolder}`);
          } catch (err) {
            console.error(`Error deleting old category folder: ${err.message}`);
          }
        }
      }

      
      await knex('request_master')
        .where({ request_id })
        .update({
          request_status,
          comm_Area,
          comm_Act,
          date_Time,
          comm_Venue,
          comm_Guest,
          comm_Emps,
          comm_Benef,
          comm_Desc,
          comm_Category,
          updated_by: updatedByValue,
          updated_at: currentTimestamp,
        });

        
    await knex('request_logs').insert({
      request_id,
      request_status,
      comm_Category,
      comm_Area,
      comm_Act,
      time_date: currentTimestamp,
      changes_made: changes_made
    });
    }

    res.status(200).json({ message: "Request updated successfully" });

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update request", details: err.message });
  }
});


// Deleting Request 
router.get('/delete-request', async (req, res) => {
  try {
    const request_id = req.query.request_id;
    const currentUser = req.query.currentUser;

    if (!request_id) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    const currentTimestamp = new Date();


    const files = await knex('request_master')
      .where({ request_id })
      .select('comm_Docs');
    const requestData = await knex('request_master').where({request_id}).first();

      await knex('request_logs').insert({
      request_id: request_id,
      request_status: requestData.request_status ,
      comm_Category: requestData.comm_Category,
      comm_Area: requestData.comm_Area,
      comm_Act: requestData.comm_Act,
      time_date: currentTimestamp,
      changes_made: `Request Id: ${requestData.request_id} was deleted by ${currentUser}`

    })

   
    const fsPromises = require('fs').promises;

for (const file of files) {
  const fullFilePath = path.join(__dirname, '..', 'uploads', `request_${request_id}`, file.comm_Docs);
  try {
    await fsPromises.unlink(fullFilePath);
    console.log(`Deleted file: ${fullFilePath}`);
  } catch (err) {
    console.error(`Failed to delete file ${fullFilePath}:`, err.message);
  }
}

    await knex('request_master')
      .where({ request_id })
      .update({
        is_active: '0',
        updated_by: currentUser,
        updated_at: currentTimestamp
      });

    await knex('upload_master').where({ request_id }).del();

    res.status(200).json({ message: 'Request and files deleted successfully' });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ error: 'Failed to delete the request' });
  }
});



const Comments = db.define('comment_master',{
        comment_id:{
            type:DataTypes.INTEGER,
            primaryKey: true
        },
        comment:{
          type:DataTypes.STRING
        },
        created_by:{
          type:DataTypes.STRING
        },
        created_at:{
          type:DataTypes.STRING
        },
        request_id:{
          type: DataTypes.INTEGER
        }
    },{
        freezeTableName: false,
        timestamps: false,
        createdAt: false,
        updatedAt: false,
        tableName: 'comment_master'
    })

// GET comments for a specific request
router.get('/comment/:request_id', async (req, res) => {

  try {
    const request_id = req.params.request_id;
    console.log(request_id);


    const comments = await knex('comment_master')
      .where({ request_id })
      .orderBy('created_at', 'desc');
    res.json(comments);


  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

//Handling Comments After Pressing Declined Button
router.post('/comment', async (req, res) => {
  try {
    const { comment, created_by, request_id } = req.body;
    const created_at = new Date();

    const requestInfo = await knex('request_master').where('request_id', request_id).first();

    console.log('Received comment data:', { comment, created_by, request_id });

    // Insert the comment (SQL Server returns inserted ID as an array)
    const [comment_id] = await knex('comment_master')
      .insert({
        comment,
        created_by,
        created_at,
        request_id
      }).returning('comment_id');

    console.log('Inserted comment ID:', comment_id);

    // Update the request_master with the new comment ID
    await knex('request_master')
      .where({ request_id })
      .update({
        comment_id,
        updated_by: created_by,
        updated_at: created_at
      });
    await knex('request_logs').insert({
      request_id: request_id,
      request_status: requestInfo.request_status,
      comm_Category: requestInfo.comm_Category,
      comm_Area: requestInfo.comm_Area,
      comm_Act: requestInfo.comm_Act,
      time_date: created_at,
      changes_made: `${created_by} added a comment "${comment}"`
    })

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({
      message: 'Failed to add comment',
      error: err.message,
      stack: err.stack 
    });
  }
});

//Saving/Updating Informations Once Request Was Declined
router.post('/comment-decline', async function (req, res, next) {
  
  const currentTimestamp = new Date();
  const {
    emp_position,
    request_id,
    id_master,
    currentUser
  } = req.body;

  const requestInfo = await knex('request_master').where('request_id', request_id).first();
  const empInfo = await knex('users_master').where('id_master', id_master).first();
  const emp_role = empInfo.emp_role;
  try {
    
      if (emp_position === 'comrelofficer'){
      await knex('request_master')
      .where({ request_id})
      .update({
        request_status: 'reviewed',
        updated_by: currentUser,
        updated_at: currentTimestamp,
        comrelofficer: 0,
        comrelthree: 0,
        comreldh: 0
      });
    }
    else if (emp_position === 'comrelthree'){
      await knex('request_master')
      .where({ request_id})
      .update({
        request_status: 'reviewed',
        updated_by: currentUser,
        updated_at: currentTimestamp,
        comrelofficer: 0,
        comrelthree: 0,
        comreldh: 0
      });
    }
    else if (emp_position === 'comreldh'){
      await knex('request_master')
      .where({ request_id})
      .update({
        request_status: 'reviewed',
        updated_by: currentUser,
        updated_at: currentTimestamp,
        comrelofficer: 0,
        comrelthree: 0,
        comreldh: 0
      });
    }

    await knex('request_logs').insert({
      request_id: request_id,
      request_status: requestInfo.request_status,
      comm_Category: requestInfo.comm_Category,
      comm_Area: requestInfo.comm_Area,
      comm_Act: requestInfo.comm_Act,
      time_date: currentTimestamp,
      changes_made: `${emp_position} ${currentUser} declined RequestID: ${request_id}. Changed the request_status to "reviewed" `
    })

    res.status(200).json({ message: 'Request status updated successfully' });
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({ message: 'Failed to update request status' });
  }
});

// Saving/Updating Informations On Table Once Request Was Accepted
router.post('/accept', async (req, res) => {
  const currentTimestamp = new Date();
  const { request_id, currentUser, emp_position, id_master} = req.body;

  try {
    const requestInfo = await knex('request_master').where('request_id', request_id).first();
    const empInfo = await knex('users_master').where('id_master', id_master).first();
    const emp_role = empInfo.emp_role;


    if (!requestInfo) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const filenames = requestInfo.comm_Docs
      ? requestInfo.comm_Docs.split(',').map(f => f.trim()).filter(f => f)
      : [];

    const category = requestInfo.comm_Category?.replace(/\s+/g, '_') || 'Uncategorized';
    const categoryRequestDir = path.join('./uploads', category, `request_${request_id}`);
    const galleryDir = path.join(categoryRequestDir, 'gallery');
    const filesDir = path.join(categoryRequestDir, 'files');

  // User for COMREL OFFICER
    if (emp_position === 'comrelofficer') {
      // Create target folders
      await fsp.mkdir(galleryDir, { recursive: true });
      await fsp.mkdir(filesDir, { recursive: true });

      const galleryExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv'];
      const newPaths = [];

      for (const file of filenames) {
        const ext = path.extname(file).toLowerCase();
        const srcPath = path.join('./uploads', file);
        const destFolder = galleryExtensions.includes(ext) ? galleryDir : filesDir;
        const destRelativePath = path.join( category, `request_${request_id}`, galleryExtensions.includes(ext) ? 'gallery' : 'files', file);
        const destPath = path.join(destFolder, file);

        try {
          if (fs.existsSync(srcPath)) {
            await fsp.rename(srcPath, destPath);
            newPaths.push(destRelativePath);

            await knex('upload_master')
              .where({ request_id, file_name: file.replace(/^.*?_/, '') })
              .update({
                file_path: path.join('uploads', destRelativePath),
                updated_at: currentTimestamp
              });

            console.log(`Moved file: ${file} → ${destRelativePath}`);
          } else {
            console.warn(`File not found: ${srcPath}`);
          }
        } catch (err) {
          console.error(`Failed to move or update ${file}:`, err);
        }
      }

      const updateData = {
        request_status: 'Pending review for ComrelIII',
        updated_by: currentUser,
        updated_at: currentTimestamp,
        comrelofficer: 1
      };

      if (newPaths.length > 0) {
        updateData.comm_Docs = newPaths.join(',');
      }

      await knex('request_master')
        .where({ request_id })
        .update(updateData);

      await knex('request_logs').insert({
        request_id: request_id,
        request_status: requestInfo.request_status,
        comm_Category: requestInfo.comm_Category,
        comm_Act: requestInfo.comm_Act,
        comm_Area: requestInfo.comm_Area,
        time_date: currentTimestamp,
        changes_made: `ComrelOfficer ${currentUser} accepted the request. Changed the status to "Pending review for ComrelIII"`
      })
    }

    // USER COMREL III
    else if (emp_position === 'comrelthree') {
      await knex('request_master')
        .where({ request_id })
        .update({
          request_status: 'Pending review for Comrel DH',
          updated_by: currentUser,
          updated_at: currentTimestamp,
          comrelthree: 1
        });
      await knex('request_logs').insert({
        request_id: request_id,
        request_status: requestInfo.request_status,
        comm_Category: requestInfo.comm_Category,
        comm_Act: requestInfo.comm_Act,
        comm_Area: requestInfo.comm_Area,
        time_date: currentTimestamp,
        changes_made: `Comrel III ${currentUser} accepted the request. Changed the status to "Pending review for DH"`
      })
    }
    // USER COMREL DEPARTMENT HEAD
    else if (emp_position === 'comreldh') {
      await knex('request_master')
        .where({ request_id })
        .update({
          request_status: 'accepted',
          updated_by: currentUser,
          updated_at: currentTimestamp,
          comreldh: 1
        });
      await knex('request_logs').insert({
        request_id: request_id,
        request_status: requestInfo.request_status,
        comm_Category: requestInfo.comm_Category,
        comm_Act: requestInfo.comm_Act,
        comm_Area: requestInfo.comm_Area,
        time_date: currentTimestamp,
        changes_made: `ComrelOfficer DH ${currentUser} accepted the request. Changed the status to "accepted"`
      })
    }
    
    res.status(200).json({ message: 'Request accepted successfully.' });
  } catch (err) {
    console.error('Accept error:', err);
    res.status(500).json({ message: 'Failed to accept request', error: err.message });
  }
});

//Download All Files
router.post('/download-all', async (req, res) => {
  const { files } = req.body;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Invalid files array.' });
  }

  try {
    const archive = archiver('zip', { zlib: { level: 9 } });
    res.setHeader('Content-Disposition', 'attachment; filename=request_files.zip');
    res.setHeader('Content-Type', 'application/zip');
    archive.pipe(res);

    files.forEach(filePath => {
      const cleanPath = filePath.replace(/\\/g, '/');
      const fullPath = path.join(__dirname, '../uploads', cleanPath);
      if (fs.existsSync(fullPath)) {
        archive.file(fullPath, { name: path.basename(cleanPath) });
      }
    });

    await archive.finalize();
  } catch (err) {
    console.error('Zip creation failed:', err);
    res.status(500).json({ error: 'Failed to zip files.' });
  }

});

//Sending A Email When Request Was Accepted
router.post('/email-post', async function (req,res,next) {

  console.log('EMAIL:', process.env.EMAIL);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASS ? '*****' : 'MISSING');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

  const time_Date = new Date().toLocaleString();
  const empInfo = await knex('users_master').where('id_master', req.body.id_master).first();
  
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: false,

      auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
      },
      tls: {
    rejectUnauthorized: false 
  }
    });

    let email = [];

    if(empInfo.emp_position === 'comrelofficer'){
      const allOfficer = await knex.select('*').from('users_master')
                          .where('emp_position', 'comrelthree');
      console.log("User emails",allOfficer);

      const userEmail = allOfficer.map(user => user.emp_email);
      email = userEmail

        var start = 'Good Day,<br><br>'
                + 'This is to formally inform you that a request has been accepted by <b>'+ 'Comrel Officer'  
                + ': '+ empInfo.emp_firstname.charAt(0).toUpperCase() + empInfo.emp_firstname.slice(1).toLowerCase()+ ' ' 
                + empInfo.emp_lastname.charAt(0).toUpperCase() + empInfo.emp_lastname.slice(1).toLowerCase()
                +'. </b>'
                + 'To view and review the request, kindly click the link below. <br>'
                + '<b>Link: </b>'+process.env.REACT_CLIENT +'<br>'
                + 'Below is a summary of the request submitted under your position.<br>'

        var body = '<ul>'+
                  '<li>'+'<b>Request Id: </b>'+req.body.request_id +'</li>' +
                  '<li>'+'<b>Activity: </b>'+req.body.comm_Act +'</li>' +
                  '<li>'+'<b>Location: </b>'+req.body.comm_Area +'</li>' +
                  '<li>'+'<b>Date & Time: </b>'+ req.body.date_Time +'</li>' +
                  '<li><b>Description: </b><br>' + req.body.comm_Desc + '</li>' +
              '</ul>'
              + 'If you have concerns or questions, please do not hesitate to conctact the MIS Support Team.<br><br>'
              + 'Wishing you a great day ahead.<br>'

    }else if(empInfo.emp_position === 'comrelthree'){
      const allOfficer = await knex.select('*').from('users_master')
                          .where('emp_position', 'comreldh');
      console.log("User emails",allOfficer);

      const userEmail = allOfficer.map(user => user.emp_email);
      email = userEmail

        var start = 'Good Day,<br><br>'
                + 'This is to formally inform you that a request has been accepted by <b>'+ 'Comrel III' 
                + ': '+ empInfo.emp_firstname.charAt(0).toUpperCase() + empInfo.emp_firstname.slice(1).toLowerCase()+ ' ' 
                + empInfo.emp_lastname.charAt(0).toUpperCase() + empInfo.emp_lastname.slice(1).toLowerCase()
                +'. </b>'
                + 'To view and review the request, kindly click the link below. <br>'
                + '<b>Link: </b>'+process.env.REACT_CLIENT +'<br>'
                + 'Below is a summary of the request submitted under your position.<br>'
        var body = '<ul>'+
                  '<li>'+'<b>Request Id: </b>'+req.body.request_id +'</li>' +
                  '<li>'+'<b>Activity: </b>'+req.body.comm_Act +'</li>' +
                  '<li>'+'<b>Location: </b>'+req.body.comm_Area +'</li>' +
                  '<li>'+'<b>Date & Time: </b>'+ req.body.date_Time +'</li>' +
                  '<li><b>Description: </b><br>' + req.body.comm_Desc + '</li>' +
                  '</ul>'
              + 'If you have concerns or questions, please do not hesitate to conctact the MIS Support Team.<br><br>'
              + 'Wishing you a great day ahead.<br>'
    }else if(empInfo.emp_position === 'comreldh'){
      const allOfficer = await knex.select('*').from('users_master')
                          .where('emp_position', 'comreldh');
      console.log("User emails",allOfficer);

      const userEmail = allOfficer.map(user => user.emp_email);
      email = userEmail

      var start = 'Good Day,<br><br>'
                + 'This is to formally inform you that a request has been accepted by <b>'+ 'Comrel Department Head' 
                + ': '+ empInfo.emp_firstname.charAt(0).toUpperCase() + empInfo.emp_firstname.slice(1).toLowerCase()+ ' ' 
                + empInfo.emp_lastname.charAt(0).toUpperCase() + empInfo.emp_lastname.slice(1).toLowerCase()
                +'. </b>'
                + 'To view and review the request, kindly click the link below. <br>'
                + '<b>Link: </b>'+process.env.REACT_CLIENT +'<br>'
                + 'Below is a summary of the request submitted under your position.<br>'
      var body = '<ul>'+
                  '<li>'+'<b>Request Id: </b>'+req.body.request_id +'</li>' +
                  '<li>'+'<b>Activity: </b>'+req.body.comm_Act +'</li>' +
                  '<li>'+'<b>Location: </b>'+req.body.comm_Area +'</li>' +
                  '<li>'+'<b>Date & Time: </b>'+ req.body.date_Time +'</li>' +
                  '<li><b>Description: </b><br>' + req.body.comm_Desc + '</li>' +
              '</ul>'
              + 'If you have concerns or questions, please do not hesitate to conctact the MIS Support Team.<br><br>'
              + 'Wishing you a great day ahead.<br>'
    }

   

    var privacy = '<br><p style="color:gray;font-size:12px">Privacy Notice: </p>' +
          '<p style="color:gray;font-size:12px">The content of this email is intended for the person ' + 
          'or entity to which it is addressed only. This email may contain confidential information. If you are not the person ' +
          'to whom this message is addressed, be aware that any use, reproduction, or distribution of this message is strictly ' + 
          'prohibited.</p>'  


    var Email = start + body + privacy

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Community Relations Information System Notification',
      html: Email,
    }
    
    await transporter.sendMail(mailOption);
    res.status(200).json({message: "email sent succesfully"});



  }catch(err){
    console.log('ERROR SENDING EMAIL:', err);
    res.status(500).json({message: 'EMAIL FAILED TO SEND.'});
  }

})
//Declining A Email When Request Was Declined
router.post('/email-post-decline', async function (req,res,next) {

  console.log('EMAIL:', process.env.EMAIL);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASS ? '*****' : 'MISSING');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

  const time_Date = new Date().toLocaleString();
  const empInfo = await knex('users_master').where('id_master', req.body.id_master).first();
  
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: false,

      auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
      },
      tls: {
    rejectUnauthorized: false 
  }
    });

    let email = [];

      const allOfficer = await knex.select('*').from('users_master')
                          .where('emp_position', 'encoder');
      console.log("User emails",allOfficer);

      const userEmail = allOfficer.map(user => user.emp_email);
      email = userEmail

        var start = 'Good Day,<br><br>'
                + 'This is to formally inform you that a request has been reviewed by <b>'
                + empInfo.emp_position.charAt(0).toUpperCase() + empInfo.emp_position.slice(1).toLowerCase()
                + ': '+ empInfo.emp_firstname.charAt(0).toUpperCase() + empInfo.emp_firstname.slice(1).toLowerCase()+ ' ' 
                + empInfo.emp_lastname.charAt(0).toUpperCase() + empInfo.emp_lastname.slice(1).toLowerCase()
                +'. </b>'
                + 'To view and review the request, kindly click the link below. <br>'
                + '<b>Link: </b>'+process.env.REACT_CLIENT +'<br>'
                + 'Below is a summary of the request submitted under your position.<br>'

        var body = '<ul>'+
                  '<li>'+'<b>Request Id: </b>'+req.body.request_id +'</li>' +
                  '<li>'+'<b>Activity: </b>'+req.body.comm_Act +'</li>' +
                  '<li>'+'<b>Location: </b>'+req.body.comm_Area +'</li>' +
                  '<li>'+'<b>Date & Time: </b>'+ req.body.date_Time +'</li>' +
                  '<li><b>Description: </b><br>' + req.body.comm_Desc + '</li>' +
                  '<li><b>Comment: </b>' + req.body.comment + '</li>' +
                  '</ul>'
              + 'If you have concerns or questions, please do not hesitate to conctact the MIS Support Team.<br><br>'
              + 'Wishing you a great day ahead.<br>'
   

        var privacy = '<br><p style="color:gray;font-size:12px">Privacy Notice: </p>' +
              '<p style="color:gray;font-size:12px">The content of this email is intended for the person ' + 
              'or entity to which it is addressed only. This email may contain confidential information. If you are not the person ' +
              'to whom this message is addressed, be aware that any use, reproduction, or distribution of this message is strictly ' + 
              'prohibited.</p>'  


    var Email = start + body + privacy

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Community Relations Information System Notification',
      html: Email,
    }
    
    await transporter.sendMail(mailOption);
    res.status(200).json({message: "email sent succesfully"});

  }catch(err){
    console.log('ERROR SENDING EMAIL:', err);
    res.status(500).json({message: 'EMAIL FAILED TO SEND.'});
  }
})
// Adding Form Request then send Email 
router.post('/email-post-add', async function (req,res,next) {

  console.log('EMAIL:', process.env.EMAIL);
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASS ? '*****' : 'MISSING');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);

  const time_Date = new Date().toLocaleString();
  const empInfo = await knex('users_master').where('id_master', req.body.id_master).first();
  
  try{
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      secure: false,

      auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
      },
      tls: {
    rejectUnauthorized: false 
  }
    });

    let email = [];

  
      const allOfficer = await knex.select('*').from('users_master')
                          .where('emp_position', 'comrelofficer');
      console.log("User emails",allOfficer);

      const userEmail = allOfficer.map(user => user.emp_email);
      email = userEmail

        var start = 'Good Day,<br><br>'
                + 'This is to formally inform you that a request has been submitted by <b>'
                + empInfo.emp_position.charAt(0).toUpperCase() + empInfo.emp_position.slice(1).toLowerCase()  
                + ': '+ empInfo.emp_firstname.charAt(0).toUpperCase() + empInfo.emp_firstname.slice(1).toLowerCase()+ ' ' 
                + empInfo.emp_lastname.charAt(0).toUpperCase() + empInfo.emp_lastname.slice(1).toLowerCase()
                +'. </b>'
                + 'To view and review the request, kindly click the link below. <br>'
                + '<b>Link: </b>'+process.env.REACT_CLIENT +'<br>'
                + 'Below is a summary of the request submitted under your position.<br>'

        var body = '<ul>'+
                  '<li>'+'<b>Activity: </b>'+req.body.comm_Act +'</li>' +
                  '<li>'+'<b>Location: </b>'+req.body.comm_Area +'</li>' +
                  '<li>'+'<b>Date & Time: </b>'+ time_Date +'</li>' +
                  '<li><b>Description: </b><br>' + req.body.comm_Desc + '</li>' +
              '</ul>'
              + 'If you have concerns or questions, please do not hesitate to conctact the MIS Support Team.<br><br>'
              + 'Wishing you a great day ahead.<br>'

  
   

    var privacy = '<br><p style="color:gray;font-size:12px">Privacy Notice: </p>' +
          '<p style="color:gray;font-size:12px">The content of this email is intended for the person ' + 
          'or entity to which it is addressed only. This email may contain confidential information. If you are not the person ' +
          'to whom this message is addressed, be aware that any use, reproduction, or distribution of this message is strictly ' + 
          'prohibited.</p>'  


    var Email = start + body + privacy

    const mailOption = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Community Relations Information System Notification',
      html: Email,
    }
    
    await transporter.sendMail(mailOption);
    res.status(200).json({message: "email sent succesfully"});



  }catch(err){
    console.log('ERROR SENDING EMAIL:', err);
    res.status(500).json({message: 'EMAIL FAILED TO SEND.'});
  }
})





module.exports = router;