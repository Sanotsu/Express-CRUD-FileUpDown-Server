
const mysql = require('mysql2');
const config = require('../../config');

function createPool() {
    try {
        const pool = mysql.createPool({
            host: config.db_host,
            port: config.db_port,
            user: config.db_user,
            password: config.db_password,
            database: config.db_name,
            connectionLimit: 10,
            waitForConnections: true,
            queueLimit: 0
        });

        const promisePool = pool.promise();

        return promisePool;
    } catch (error) {
        return console.log(`Could not connect - ${error}`);
    }
}

const pool = createPool();

module.exports = pool;


//單個查詢條件 精確/模糊查詢
//參數分別為 需要查詢的table，查詢類型（精確/模糊），單個查詢條件欄位，查詢的值，查詢返回結果的欄位
pool.singleConditionQuery = async (table, queryType, condition, conditionValue, fields = '*') => {

    let rows;

    if (queryType.toLowerCase() === "exact") {
        [rows] = await pool.query(`SELECT ${fields} FROM ${table} WHERE ${condition}=?`, [conditionValue]);
    } else if (queryType.toLowerCase() === "fuzzy") {
        [rows] = await pool.query(`SELECT ${fields} FROM ${table} WHERE ${condition} like ?`, ["%" + conditionValue + "%"]);
    } else {
        throw { code: 2345, msg: 'wrong query type' };
    }
    return rows;
}

