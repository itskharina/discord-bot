const db = require('./init');
const dbQueue = require('../services/database-queue');

// Onject containing all database operations
const dbOperations = {
	// Adds or updates a game in user's wishlist
	addToWishlist: (userId, gameName, currentPrice, targetPrice) => {
		return dbQueue.add(
			() =>
				new Promise((resolve, reject) => {
					// Using UPSERT (INSERT or UPDATE if exists) pattern
					const query = `
                		INSERT INTO wishlist 
                		(user_id, game_name, current_price, target_price)
               		    VALUES (?, ?, ?, ?)
                		ON CONFLICT(user_id, game_name) 
                		DO UPDATE SET target_price = ?, current_price = ?
           		 	`;
					db.run(
						query,
						[
							// For INSERT VALUES:
							userId, // user_id
							gameName, // game_name
							currentPrice, // current_price
							targetPrice, // target_price

							// For ON CONFLICT UPDATE:
							targetPrice, // UPDATE target_price = ?
							currentPrice, // UPDATE current_price = ?
						],
						function (err) {
							if (err) reject(err);
							resolve(this);
						},
					);
				}),
		);
	},

	// Retrieves wishlist items for a specific user
	getWishlist: (userId) => {
		return new Promise((resolve, reject) => {
			// SQL query to get wishlist items for a user
			const query = `
				SELECT game_name, target_price, current_price 
				FROM wishlist 
				WHERE user_id = ?
			`;
			db.all(
				query,
				[userId],
				// Callback function that runs when query completes
				(err, rows) => {
					if (err) reject(err); // If error, reject Promise with error
					resolve(rows); // If successful, resolve Promise with rows
				},
			);
		});
	},

	// Gets all wishlist entries; used for the price checker function
	getAllWishlistGames: () => {
		return new Promise((resolve, reject) => {
			const query = `
				SELECT user_id, game_name, current_price, target_price
				FROM wishlist
			`;
			// db.all() gets ALL rows that match the query
			db.all(query, [], (err, rows) => {
				if (err) reject(err);
				resolve(rows);
			});
		});
	},

	// Updates current price and notification timestamp for a game
	updateWishlistCurrentPrice: (userId, gameName, currentPrice) => {
		return dbQueue.add(
			() =>
				new Promise((resolve, reject) => {
					const query = `
						UPDATE wishlist
						SET current_price = ?
						WHERE user_id = ? AND game_name = ?
					`;
					db.all(query, [currentPrice, userId, gameName], (err) => {
						if (err) reject(err);
						resolve();
					});
				}),
		);
	},

	// Removes a game from user's wishlist
	removeFromWishlist: (userId, gameName) => {
		return dbQueue.add(
			() =>
				new Promise((resolve, reject) => {
					const query = `
						DELETE FROM wishlist 
						WHERE user_id = ? 
						AND game_name = ?
					`;
					db.all(query, [userId, gameName], (err) => {
						if (err) reject(err);
						resolve();
					});
				}),
		);
	},

	// Get user by their ID
	getUserById: (userId) => {
		return new Promise((resolve, reject) => {
			const query = `
			SELECT * 
			FROM wishlist
			WHERE user_id = ?
			`;
			db.get(query, [userId], (err, row) => {
				if (err) reject(err);
				resolve(row);
			});
		});
	},

	// Updates the last notified price alert timestamp for a game
	updateLastNotified: (userId, gameName) => {
		return new Promise((resolve, reject) => {
			const query = `
			UPDATE wishlist
			SET last_notified = CURRENT_TIMESTAMP
			WHERE user_id = ? 
			AND game_name = ?
			`;
			db.run(query, [userId, gameName], (err) => {
				if (err) reject(err);
				resolve();
			});
		});
	},
};

module.exports = dbOperations;
