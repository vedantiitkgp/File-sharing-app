const File = require('./models/file');
const fs = require('fs');
const connectDB = require('./config/db');
connectDB();

async function fetchData(){
    // 24 hrs
    const pastDate = new Date(Date.now() - 24*60*60*1000);
    const files = await File.find({ createdAt : { $lt : pastDate } })
    if(files.length){
        for(const file of files){
            try{
                fs.unlinkSync(file.path);
                await file.remove();
                console.log(`succesfully deleted ${file.fileName}`);
            } catch(err){
                console.log(`Error while deleting filee ${err}`);
            }
        }
        console.log('Job done!');
    }
}

fetchData().then(process.exit)