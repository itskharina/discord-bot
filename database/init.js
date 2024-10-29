const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const db = new sqlite3.Database(
	path.join(__dirname, '../wishlist.db'),
	sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
	(err) => {
		if (err) {
			console.error('Error opening database:', err);
		} else {
			console.log('Database connected');
		}
	},
);

db.serialize(() => {
	db.run('PRAGMA busy_timeout = 6000');

	db.run(
		`
        CREATE TABLE IF NOT EXISTS wishlist (
            user_id TEXT,
            game_name TEXT,
            current_price REAL,
            target_price REAL,
            last_notified TIMESTAMP,
            date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, game_name)
        )
    `,
		(err) => {
			if (err) {
				console.error('Error creating table:', err);
				return;
			}
			console.log('Wishlist table created or already exists');
		},
	);
});

db.on('error', (err) => {
	console.error('Database error:', err);
});

module.exports = db;