const router = require('express').Router();
const File = require('../models/file');

router.get('/:uuid',async (req, res)=>{
    try{
        const file = await File.findOne({ uuid : req.params.uuid });
        if(!file){
            res.render('download',{ error : 'Link has expired.' });
        }
        return res.render('download',{
            uuid : file.uuid,
            fileName : file.fileName,
            fileSize : file.size,
            downloadLink : `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })
    } catch(err){
        res.render('download',{ error : 'Something went wrong.' });
    }

})

module.exports = router;