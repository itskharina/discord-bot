// Function to fetch and return Steam game price information
const getGameSteamPrice = async (gameName) => {
	// Construct the API URL for searching games, with proper encoding of the game name
	const apiUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(gameName)}&cc=us&l=en`;

	try {
		// First API call to search for the game
		const response = await fetch(apiUrl);

		if (!response.ok) {
			throw new Error(`API request failed with a status of ${response.status}`);
		}

		const gameNameData = await response.json();

		// Check if any games were found
		if (gameNameData.total === 0) {
			console.log(
				"You have either spelt the game name wrong or the game doesn't exist.",
			);
			return;
		}

		// Extract the game ID from the first search result
		const gameId = gameNameData.items[0].id;

		// Second API call to get detailed information about the specific game
		const response2 = await fetch(
			`https://store.steampowered.com/api/appdetails?&appids=${gameId}`,
		);

		if (!response2.ok) {
			throw new Error(
				`API request failed with a status of ${response2.status}`,
			);
		}

		const gameIdData = await response2.json();

		// Extract the official game name from the response
		const name = gameIdData[gameId].data.name;

		// Initialize price-related variables
		let initialPrice;
		let finalPrice;
		let discount;

		// Check if the game is free or paid
		if (!gameIdData[gameId].data.is_free) {
			// Extract price information for paid games
			const priceDetails = gameIdData[gameId].data.price_overview;
			initialPrice = priceDetails.initial_formatted;
			finalPrice = priceDetails.final_formatted;
			discount = priceDetails.discount_percent;
		} else {
			// Handle free games
			finalPrice = 'Game is free';
		}

		// Return an object containing all gathered information
		return {
			name,
			initialPrice,
			finalPrice,
			discount,
			link: `https://store.steampowered.com/app/${gameId}`,
		};
	} catch (error) {
		// Log any errors that occur during the API calls
		console.error('Error fetching data:', error);
	}
};

module.exports = getGameSteamPrice;
