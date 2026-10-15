require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const database = process.env.DB_NAME;
const connectionOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

const pool = mysql.createPool({
    ...connectionOptions,
    database
}).promise();

async function initializeDatabase() {
    if (!database) {
        throw new Error('A variável de ambiente DB_NAME não foi configurada.');
    }

    const connection = await mysql.createConnection(connectionOptions).promise();

    try {
        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
    } finally {
        await connection.end();
    }

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema.split(';').map((statement) => statement.trim()).filter(Boolean);

    for (const statement of statements) {
        await pool.query(statement);
    }
}

pool.initializeDatabase = initializeDatabase;

module.exports = pool;