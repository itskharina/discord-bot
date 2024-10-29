const getGameAKSPrice = require('../allkeyshop-scraper');
const getGameSteamPrice = require('../steam-price-checker');

async function getPriceInfo(gameName) {
	try {
		// Fetch prices from both sources simultaneously
		const [aksResult, steamResult] = await Promise.all([
			getGameAKSPrice(gameName),
			getGameSteamPrice(gameName),
		]);

		// Retrieve the game name and the game data
		const { actualGameName, AKSGameInfo } = aksResult;
		const steamGameInfo = steamResult;

		let lowestAKSPrice = null;
		let AKSFormattedPrice = null;
		let steamPrice = null;
		let steamFormattedPrice = null;

		// Extract AllKeyShop price if available (both with and without the '£' symbol)
		if (AKSGameInfo && AKSGameInfo.length > 0) {
			const lowestAKSPriceInfo = AKSGameInfo[0];
			lowestAKSPrice = Number.parseFloat(lowestAKSPriceInfo.priceToSort);
			AKSFormattedPrice = lowestAKSPriceInfo.price;
		}

		// Extract Steam price if available (both with and without the '£' symbol)
		if (steamGameInfo?.finalPrice) {
			steamPrice = Number.parseFloat(steamGameInfo.finalPrice.replace('£', ''));
			steamFormattedPrice = steamGameInfo.finalPrice;
		}

		// Determine the lowest price between both sources
		const currentLowestPrice =
			lowestAKSPrice !== null && steamPrice !== null
				? lowestAKSPrice < steamPrice
					? AKSFormattedPrice
					: steamFormattedPrice
				: AKSFormattedPrice || steamFormattedPrice || 'Price not available';

		return {
			actualGameName: actualGameName || gameName,
			currentPrice: currentLowestPrice,
			AKSFormattedPrice,
			steamFormattedPrice,
			lowestAKSPrice,
			steamPrice,
		};
	} catch (error) {
		console.error('Error in getPriceInfo:', error);
		throw error;
	}
}

module.exports = getPriceInfo;
