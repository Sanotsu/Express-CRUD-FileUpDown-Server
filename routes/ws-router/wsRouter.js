let express = require('express');
let pool = require('../../libs/mysql/mysql2');
let getFormatDate = require('../../libs/common/dateFormat').getFormatDate();
let fs = require('fs')

let router = express.Router();

router.ws('/wsquerydata', async (ws, res) => {

    ws.on('message', async (msg) => {

        let { name } = JSON.parse(msg);
        let queryType = '';
        if (name === '') {
            queryType = 'fuzzy'
        } else {
            queryType = 'exact'
        }

        let data = await pool.singleConditionQuery('employee', queryType, 'name', name);

        ws.send(JSON.stringify({ 'data': data }))
    });
})

router.ws('/wsupdatedata', async (ws, res) => {

    ws.on('message', async (msg) => {

        let { age, mail, name } = JSON.parse(msg);

        await pool.query("UPDATE employee SET age=?,mail=? WHERE NAME=?", [age, mail, name]);
        let result = { 'Action': 'UpdateEmployee', 'IsSuccess': true, 'Message': 'Update ' + name + ' Success!' };

        ws.send(JSON.stringify(result))
    })
})

router.ws('/wsinsertdata', async (ws, res) => {

    ws.on('message', async (msg) => {

        let { age, mail, name, empDate, sex } = JSON.parse(msg);
        empDate = getFormatDate(new Date(empDate));

        await pool.query("INSERT INTO employee (name, age, sex, empDate, mail) VALUES(?,?,?,?,?)", [
            name, age, sex, empDate, mail]);

        let result = { 'Action': 'InsertEmployee', 'IsSuccess': true, 'Message': 'Insert ' + name + ' Success!' };
        ws.send(JSON.stringify(result))
    })
})

router.ws('/wsdeletedata', async (ws, res) => {

    ws.on('message', async (msg) => {

        let { name } = JSON.parse(msg);

        await pool.query("DELETE FROM employee WHERE NAME=?", [name]);

        let result = { 'Action': 'DeleteEmployee', 'IsSuccess': true, 'Message': 'Delete ' + name + ' Success!' };
        ws.send(JSON.stringify(result))
    })
})

router.ws('/wsupload', async (ws, res) => {
    let filename = ''
    let buf;
    let fileinfo;

    ws.on('message', async (msg) => {

        if (typeof (msg) === 'string') {
            fileinfo = JSON.parse(msg);
            filename = fileinfo.name;
        } else if (typeof (msg) === 'object') {
            buf = (Buffer.from(msg));
            if (filename.length > 0 && buf.length > 0) {
                try {
                    fs.writeFileSync(`upload-ws/${filename}`, buf, 'binary');

                    //整理相關數據，存到數據庫
                    let file_data = buf;
                    let file_type = fileinfo.type;
                    let file_name = fileinfo.name;
                    let file_size = fileinfo.size;
                    let updateParams = [file_type, file_data, file_size, new Date(), file_name];
                    let insertParams = [file_type, file_name, file_data, file_size, new Date(), new Date()];

                    //找到編號之後賦值其他參數
                    let sql = 'INSERT INTO  files( '
                        + 'filetype,filename,filedata,length,updatedAt,createdAt)'
                        + ' VALUE(?,?,?,?,?,?) ';
                    let [checkdata] = await pool.query("SELECT * FROM files WHERE filename =? ", [file_name])

                    //如果有，就更新
                    if (checkdata.length !== 0) {
                        await pool.query('UPDATE files SET filetype=?,filedata =?,length=?,updatedAt =? WHERE filename=?',
                            updateParams)
                    } else {
                        //如果沒有，就新增
                        await pool.query(sql, insertParams)
                    }
                    let result = { 'Action': 'UploadFile', 'IsSuccess': true, 'Message': file_name + '文件上傳成功' };
                    ws.send(JSON.stringify(result))
                } catch (e) {
                    console.log("ws file upload error: ", e)
                }
            } else {
                let result = { 'Action': 'UploadFile', 'IsSuccess': false, 'Message': file_name + '上傳失敗' };
                ws.send(JSON.stringify(result))
            }
        }
    })
})

router.ws('/wsqueryfile', async (ws, res) => {

    let [filedata] = await pool.query("SELECT * FROM files where 1=1");

    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': filedata };

    ws.send(JSON.stringify(result));
})

router.ws('/wsdownlaod', async (ws, res) => {

    ws.on('message', async (msg) => {
        let name = JSON.parse(msg);

        let file = await pool.singleConditionQuery('files', 'exact', 'filename', name)
        ws.send(JSON.stringify({ 'filedata': file[0].filedata }));
    })
})


router.ws('/wscallsptest', async (ws, res) => {
    ws.on('message', async (msg) => {
        let { age, sex } = JSON.parse(msg);

        let [data] = await pool.query("call select_emp_by_sex_and_age(?, ?)", [sex, age]);

        let result = { 'Action': 'QueryEmployeeBySp', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
        ws.send(JSON.stringify(result))
    })
})

module.exports = router;