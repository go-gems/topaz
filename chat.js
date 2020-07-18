const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS messages  (
        message_id INTEGER PRIMARY KEY,
        message TEXT NOT NULL,
        author TEXT NOT NULL,
        avatar_icon TEXT NOT NULL,
        avatar_color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`
);


module.exports = {
    storeMessage(author, avatar, message) {
        db.run(`INSERT INTO messages(author, avatar_icon, avatar_color,message)values(?,?,?,?);`, [
                author, avatar.avatar, avatar.color, message
            ], (err, rows) => {
                if (err) {
                    throw err;
                }
            }
        );
    },
    async getLastMessages() {
        return new Promise(resolve => {
            let sql = `SELECT * FROM messages ORDER BY created_at DESC LIMIT 0, 30`;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    throw err;
                }
                resolve(rows.reverse())
            });
        });

    }
}