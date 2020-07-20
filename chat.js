const sqlite3 = require('sqlite3').verbose();
const plugins = require('./plugins/_plugins.js')
let pluginList = [];
let pluginConfig = JSON.parse(require('fs').readFileSync('config.json'))["plugins"];

function formatResponse(author, avatar, message) {
    return {
        author: author,
        avatar: {avatar: avatar.avatar, color: avatar.color, image: avatar.image},
        message: message,
    }
}

for (let pluginName in plugins) {
    let config = pluginConfig[pluginName] || {}
    pluginList.push(require(plugins[pluginName])(config, formatResponse))
}
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

    },
    async processMessage(author, avatar, message) {
        let item = formatResponse(author, avatar, message)
        for (let plugin of pluginList) {
            if (plugin.supports && plugin.supports(author, avatar, message)) {
                item = await plugin.transform(author, avatar, message)
                console.log(item)
                author = item.author
                avatar = item.avatar
                message = item.message
            }
        }
        return item
    },

}