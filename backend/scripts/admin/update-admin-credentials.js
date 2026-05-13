import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateCredentials() {
    const dbPath = path.resolve(__dirname, '../../database/database.sqlite');
    console.log('Connecting to database:', dbPath);
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    const targetPassword = 'Sriganth-M09@2006';
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    console.log('\n=== UPDATING ADMINS TABLE ===');
    // Ensure admins table exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            adminName TEXT UNIQUE NOT NULL,
            gmail TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Check if adminName = 'admin' exists
    const adminByUsername = await db.get('SELECT * FROM admins WHERE adminName = ?', ['admin']);
    if (adminByUsername) {
        console.log('Admin username "admin" found. Updating password...');
        await db.run('UPDATE admins SET password = ? WHERE adminName = ?', [hashedPassword, 'admin']);
    } else {
        console.log('Admin username "admin" not found. Creating default admin with username "admin"...');
        await db.run(
            'INSERT INTO admins (adminName, gmail, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@gmail.com', hashedPassword, 'admin']
        );
    }

    // Also check if adminName = 'admin@gmail.com' exists (or check if email 'admin@gmail.com' is registered)
    const adminByGmail = await db.get('SELECT * FROM admins WHERE gmail = ?', ['admin@gmail.com']);
    if (adminByGmail) {
        console.log('Admin gmail "admin@gmail.com" found. Updating password...');
        await db.run('UPDATE admins SET password = ? WHERE gmail = ?', [hashedPassword, 'admin@gmail.com']);
    }

    console.log('\n=== UPDATING USERS TABLE ===');
    // Also check users table for 'admin@techturf.com'
    const userByEmail = await db.get('SELECT * FROM users WHERE email = ?', ['admin@techturf.com']);
    if (userByEmail) {
        console.log('User "admin@techturf.com" found. Updating password to target password...');
        await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@techturf.com']);
    } else {
        console.log('User "admin@techturf.com" not found. Creating default user...');
        await db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin User', 'admin@techturf.com', hashedPassword, 'admin']
        );
    }

    // Check if 'admin@gmail.com' is in the users table and update/insert
    const userByGmail = await db.get('SELECT * FROM users WHERE email = ?', ['admin@gmail.com']);
    if (userByGmail) {
        console.log('User "admin@gmail.com" found. Updating password to target password...');
        await db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@gmail.com']);
    } else {
        console.log('Creating user "admin@gmail.com" in users table...');
        await db.run(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin Gmail User', 'admin@gmail.com', hashedPassword, 'admin']
        );
    }

    console.log('\nCredential update complete! All admin and user accounts for "admin" and "admin@gmail.com" / "admin@techturf.com" are set to password: ' + targetPassword);
    
    // Verify records
    const finalAdmins = await db.all('SELECT id, adminName, gmail, role FROM admins');
    console.log('\nAdmins in DB:', finalAdmins);

    const finalUsers = await db.all('SELECT id, name, email, role FROM users');
    console.log('Users in DB:', finalUsers);

    await db.close();
}

updateCredentials().catch(console.error);
