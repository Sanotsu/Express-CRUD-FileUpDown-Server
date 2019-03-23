let createError = require('http-errors');
let express = require('express');

//A dead simple ES6 async/await support hack for ExpressJS
require('express-async-errors');
let app = express();

//WebSocket endpoints for Express applications.
let expressWs = require('express-ws')(app);

//解決跨域問題的中間件
let cors = require('cors')

//導入路由
let indexRouter = require('./routes/base-router/login');
let usersRouter = require('./routes/base-router/employee');
let filesRouter = require('./routes/base-router/files');
let wsRouter = require('./routes/ws-router/wsRouter');

app.use(cors())

//allow custom header and CORS
// app.all('*', function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

//   if (req.method == 'OPTIONS') {
//     res.send(200); /让options请求快速返回/
//   }
//   else {
//     next();
//   }
// });

//定義數據解析器（POSTDATA可以使用的關鍵）
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//靜態資源
app.use(express.static('public'));

//使用路由
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', filesRouter);
app.use('/', wsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {

  console.log(req);
  next(createError(404));
});

//expree異步出錯的攔截
app.use((err, req, res, next) => {
  if (err.message === 'access denied') {
    res.status(403);
    res.json({ error: err.message });
  }

  console.log("app error:");
  console.log(err);
  res.send({ ok: false })
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //  the 500 error 
  res.status(500).json({
    message: err.message,
    error: err
  });
});

app.listen(2018);
console.log("server run on 2018")
