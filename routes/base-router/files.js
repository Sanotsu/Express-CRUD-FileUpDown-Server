let express = require('express');
const fs = require('fs')
let pool = require('../../libs/mysql/mysql2');

let multer = require('multer')
let upload_config = require('../../libs/common/upload_config')
let upload = multer({ storage: upload_config.Storage })

let router = express.Router();

router.post('/up', upload.single('Filename'), async (req, res) => {

    const file = req.file;
    if (!file) {
        console.log('no file')
    } else {

        //整理相關數據，存到數據庫
        let file_data = fs.readFileSync(file.path);
        let file_type = file.mimetype;
        let file_name = file.originalname;
        let file_size = file.size;
        let updateParams = [file_type, file_data, file_size, new Date(), file_name];
        let insertParams = [file_type, file_name, file_data, file_size, new Date(), new Date()];

        //找到編號之後賦值其他參數
        let sql = 'INSERT INTO  files( '
            + 'filetype,filename,filedata,length,updatedAt,createdAt)'
            + ' VALUE(?,?,?,?,?,?) ';

        let [checkdata] = await pool.query("SELECT * FROM files WHERE filename =? ", [file_name])

        //如果有，就更新
        if (checkdata.length !== 0) {
            await pool.query('UPDATE files SET filetype=?,filedata =?,length=?,updatedAt =? WHERE filename=?', updateParams)

        } else {
            //如果沒有，就新增
            await pool.query(sql, insertParams)
        }
    }
    let result = { 'Action': 'UploadFile', 'IsSuccess': 'True', 'Message': 'OK' };
    res.send(JSON.stringify(result));
})


router.post('/queryfile', async (req, res) => {

    let [filedata] = await pool.query("SELECT * FROM files where 1=1");

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': filedata };
    res.send(JSON.stringify(result));
})

router.post('/down', async (req, res) => {
    let { name } = req.body;
    let file = await pool.singleConditionQuery('files', 'exact', 'filename', name)
    res.send(file[0].filedata);
})

module.exports = router;