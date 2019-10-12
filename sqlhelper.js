const db = require('better-sqlite3')('./data/database/blockdatabase.db');

const sqlite3 = require("sqlite3").verbose();
let sqliteDbPath = "./data/database/blockdatabase.db";
var database = new sqlite3.Database(sqliteDbPath)


//创建用户表
database.run("CREATE TABLE IF NOT EXISTS  user  ( addr  TEXT PRIMARY KEY NOT NULL, coinCount  INTEGER, transactionCount   INTEGER) ").run;

//创建交易记录表
database.run("CREATE TABLE IF NOT EXISTS  block_transaction  ( senderAddr TEXT, recipientAddr TEXT, value INTEGER ) ").run;

//创建节点table
database.run("CREATE TABLE IF NOT EXISTS  block_node  ( id TEXT, url TEXT) ").run;


//关闭数据库
db.close();


// // all查询所有数据
// db.all(`select * from user`, function (err, row) {
//         if (err) throw err
//         else {
//                 console.log('all查询结果', row)
//                 // console.log(JSON.stringify(row));
//         }
// })


// // each逐条查询数据
// db.each("select * from user", function (err, row) {
//         if (err) throw err
//         else {
//                 console.log('each查询结果：', row)
//         }
// })

// // 按条件查询
// db.each("select * from user where username=?", 'miao', function (err, row) {
//         if (err) throw err
//         else {
//                 //console.log(row)
//         }
// })


// // 增加一条数据
// var sql_add = db.prepare(`insert into user (username, password, email) values('buding', '1111', '221@sdsd.com')`)
// sql_add.run()
// console.log(sql_add)

// // 删除数据
// var sql_del = db.prepare(`delete from user where username='buding'`)
// sql_del.run()

// // 修改一条数据
// var sql_modify = db.prepare(`update user set username='buding' where id=1`)
// sql_modify.run()


