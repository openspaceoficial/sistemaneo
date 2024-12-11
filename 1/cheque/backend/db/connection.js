const mysql = require('mysql2');

const pool = mysql.createPool({
    host: '127.0.0.1', // ou o IP correto
    user: 'root',
    password: '',
    database: 'sistema_cheques',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000 // 10 segundos
});


module.exports = pool.promise(); // Exporta com suporte a Promises
