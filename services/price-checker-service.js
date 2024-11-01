const {
	getAllWishlistGames,
	updateWishlistCurrentPrice,
	getUserById,
	updateLastNotified,
} = require('../database/queries');
const getPriceInfo = require('../utils/compare-prices');
const sendPriceAlert = require('../services/price-alert');

class PriceCheckerService {
	constructor() {
		this.isRunning = false;
		// Check prices every 10 minutes
		this.checkInterval = 10 * 60 * 1000;
		// Process 3 games at a time to avoid rate limits
		this.batchSize = 3;
		this.timeout = null;
	}

	async start() {
		if (this.isRunning) return;
		this.isRunning = true;
		console.log('Price checker service started');
		this.scheduleNextCheck();
	}

	stop() {
		this.isRunning = false;
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		console.log('Price checker service stopped');
	}

	async scheduleNextCheck() {
		if (!this.isRunning) return;

		try {
			await this.checkPrices();
		} catch (error) {
			console.error('Error in price checker:', error);
		}

		// Schedule next check
		this.timeout = setTimeout(
			() => this.scheduleNextCheck(),
			this.checkInterval,
		);
	}

	async checkPrices() {
		try {
			const games = await getAllWishlistGames();
			console.log(`Checking prices for ${games.length} games`);

			// Process games in batches to avoid overwhelming APIs
			for (let i = 0; i < games.length; i += this.batchSize) {
				const batch = games.slice(i, i + this.batchSize);

				// Update prices for current batch in parallel
				await Promise.all(batch.map((game) => this.updateGamePrice(game)));

				// Wait 5 seconds between batches
				if (i + this.batchSize < games.length) {
					await new Promise((resolve) => setTimeout(resolve, 5000));
				}
			}
		} catch (error) {
			console.error('Error in checkPrices:', error);
		}
	}

	async updateGamePrice(game) {
		try {
			// Retrieve the price information for the specified game
			const result = await getPriceInfo(game.game_name);

			// Update database if we got a valid price
			if (result?.currentPrice) {
				await updateWishlistCurrentPrice(
					game.user_id,
					game.game_name,
					result.currentPrice,
				);
				console.log(
					`Updated price for ${game.game_name}: ${result.currentPrice}`,
				);

				if (game.target_price && result.currentPrice <= game.target_price) {
					const now = new Date();
					const lastNotified = new Date(game.last_notified);

					// Check if the user has already been notified about the price drop
					if (game.last_notified == null) {
						// If not, send alert to the user
						await sendPriceAlert(
							game.user_id,
							game.game_name,
							result.currentPrice,
						);
						await updateLastNotified(game.user_id, game.game_name);
					}
				}
			} else {
				console.log(`No price update available for ${game.game_name}`);
			}
		} catch (error) {
			console.error(
				`Error updating price for ${game.game_name}:`,
				error.message,
			);
		}
	}
}

module.exports = new PriceCheckerService();
