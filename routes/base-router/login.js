let express = require('express');

let pool = require('../../libs/mysql/mysql2');

let router = express.Router();

/* GET home page. */
router.post('/login', async (req, res) => {

  console.log("aaaa")

  let { acc, pwd } = req.body;

  const [results] = await pool.execute("SELECT * FROM login where acc=?", [acc]);

  if (results.length > 0 && results[0].pwd === pwd) {
    let result = { 'Action': 'QueryEmployee', 'IsSuccess': true, 'Message': 'OK', 'ResponseData': 1 };

    res.end(JSON.stringify(result));
  } else {
    let err_result = { 'Action': 'QueryEmployee', 'IsSuccess': false, 'Message': 'OK', 'ResponseData': 0 };
    res.end(JSON.stringify(err_result));
  }
})

module.exports = router;


