const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4 : uuid4 } = require('uuid'); 



let storage = multer.diskStorage({
    destination : (req, file, cb) => cb(null,'uploads/'),
    filename : (re, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`
        cb(null,uniqueName);
    }
}) 

let upload = multer({
    storage,
    limit : {
        fileSize : 1000000 * 100
    }
}).single('myFile');
 
router.post('/',(req,res)=>{
    // Store file
    upload(req,res, async (err)=>{
        //Validate request
        if(!req.file){
            return req.json({error : 'All fields are required'});
        }
    
        if(err){
            res.status(500).send({ error : err.message });
        }
        // Store in database
        const file = new File({
            fileName : req.file.filename,
            uuid : uuid4(),
            path : req.file.path,
            size : req.file.size
        });

        const response = await file.save();
        //Response link
        return res.json({file : `${process.env.APP_BASE_URL}/files/${response.uuid}`});
    })
})

router.post('/send', async (req,res)=>{

    const { uuid, emailTo, emailFrom } = req.body;
     
    //Validate request
    if(!uuid || !emailTo || !emailFrom ){
        return res.status(422).send({ error : "All fields are required."});
    }
    //Get data from database
    const file = await File.findOne({ uuid : uuid });
    if(file.sender){
        return res.status(422).send({ error : "Email already sent. "});
    }

    file.sender = emailFrom;
    file.receiver = emailTo;

    const response = await file.save()

    //Send email
    const sendEmail = require('../services/emailService');
    sendEmail({
        from : emailFrom,
        to : emailTo,
        subject : 'WebShare File sharing',
        text : `${emailFrom} shared a file with you`,
        html : require('../services/emailTemplate')({
            emailFrom : emailFrom,
            downloadLink : `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size : parseInt(file.size/1000) + ' KB',
            expires : '24 hrs'
        })
    });
    return res.send({success : true});
})

module.exports = router