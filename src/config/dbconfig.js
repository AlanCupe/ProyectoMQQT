const sql = require('mssql');
require('dotenv').config(); // Cargar las variables de entorno desde el archivo .env

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        trustedConnection: process.env.DB_TRUSTED_CONNECTION === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    },
    requestTimeout: 60000 
};

const dbConnection = new sql.ConnectionPool(config);

module.exports = dbConnection;
   