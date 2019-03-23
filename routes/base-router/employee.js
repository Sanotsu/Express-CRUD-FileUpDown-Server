let express = require('express');
let pool = require('../../libs/mysql/mysql2');
let getFormatDate = require('../../libs/common/dateFormat').getFormatDate();

let router = express.Router();

router.post('/querydata', async (req, res) => {

  let { name } = req.body;
  let data = await pool.singleConditionQuery('employee', 'fuzzy', 'name', name);

  let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
  res.send(JSON.stringify(result))
})


router.post('/insertdata', async (req, res) => {

  let { name, age, sex, empDate, mail } = req.body;
  empDate = getFormatDate(new Date(empDate));

  await pool.query("INSERT INTO employee (name, age, sex, empDate, mail) VALUES(?,?,?,?,?)", [
    name, age, sex, empDate, mail]);

  let result = { 'Action': 'InsertEmployee', 'IsSuccess': true, 'Message': 'Insert ' + name + ' Success!' };
  res.send(JSON.stringify(result))
})

router.post('/updatedata', async (req, res) => {

  let { age, mail, name } = req.body;
  await pool.query("UPDATE employee SET age=?,mail=? WHERE NAME=?", [age, mail, name]);

  let result = { 'Action': 'UpdateEmployee', 'IsSuccess': true, 'Message': 'Update ' + name + ' Success!' };
  res.send(JSON.stringify(result))
})

router.post('/deletedata', async (req, res) => {

  let { name } = req.body;
  await pool.query("DELETE FROM employee WHERE NAME=?", [name]);

  let result = { 'Action': 'DeleteEmployee', 'IsSuccess': true, 'Message': 'Delete ' + name + ' Success!' };
  res.send(JSON.stringify(result))
})

router.post('/callsptest', async (req, res) => {

  let { age, sex } = req.body;
  let [data] = await pool.query("call select_emp_by_sex_and_age(?, ?)", [sex, age]);

  let result = { 'Action': 'QueryEmployeeBySp', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': data };
  res.send(JSON.stringify(result))
})


module.exports = router;
