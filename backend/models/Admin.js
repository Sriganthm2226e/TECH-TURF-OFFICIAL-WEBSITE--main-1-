import bcrypt from 'bcryptjs';

/**
 * Initialize the Admins table if it doesn't exist.
 * @param {import('sqlite').Database} db - The SQLite database instance.
 */
export async function initAdminModel(db) {
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

    // Seed default admin if table is empty
    const adminCount = await db.get('SELECT COUNT(*) as count FROM admins');
    if (adminCount.count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run(
            'INSERT INTO admins (adminName, gmail, password, role) VALUES (?, ?, ?, ?)',
            ['admin', 'admin@gmail.com', hashedPassword, 'admin']
        );
        console.log('[SEED] Default admin seeded inside separate admins table: username "admin", gmail "admin@gmail.com", password "admin123"');
    }
}

/**
 * Find admin by their adminName (Username)
 * @param {import('sqlite').Database} db 
 * @param {string} username 
 */
export async function findAdminByUsername(db, username) {
    return db.get('SELECT * FROM admins WHERE adminName = ?', [username]);
}

/**
 * Find admin by their gmail ID
 * @param {import('sqlite').Database} db 
 * @param {string} gmail 
 */
export async function findAdminByGmail(db, gmail) {
    return db.get('SELECT * FROM admins WHERE gmail = ?', [gmail]);
}

/**
 * Find admin by their ID
 * @param {import('sqlite').Database} db 
 * @param {number} id 
 */
export async function findAdminById(db, id) {
    return db.get('SELECT id, adminName, gmail, role, createdAt FROM admins WHERE id = ?', [id]);
}

/**
 * Create a new admin
 * @param {import('sqlite').Database} db 
 * @param {object} adminData 
 */
export async function createAdmin(db, { adminName, gmail, password, role = 'admin' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
        'INSERT INTO admins (adminName, gmail, password, role) VALUES (?, ?, ?, ?)',
        [adminName, gmail, hashedPassword, role]
    );
    return findAdminById(db, result.lastID);
}
