const puppeteer = require('puppeteer');

// Scrapes game pricing information from Allkeyshop.com
const scrapeAllkeyshop = async (gameName) => {
	try {
		// Format the game name for URL (lowercase and replace spaces with hyphens)
		const formattedGameName = gameName.toLowerCase().replace(/ /g, '-');
		let searchUrl = `https://www.allkeyshop.com/blog/en-gb/buy-${formattedGameName}-cd-key-compare-prices/`;

		// Initialize Puppeteer browser and new page
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		// Special case handling for Minecraft which has a different URL structure
		if (gameName === 'minecraft') {
			searchUrl =
				'https://www.allkeyshop.com/blog/en-gb/compare-and-buy-cd-key-for-digital-download-minecraft/';
		}

		// Navigate to the search URL
		await page.goto(searchUrl);

		// Check if the page exists by looking for "not found" in the title
		const is404 = await page.evaluate(() => {
			return document.querySelector('title').textContent.includes('not found');
		});

		// Exit if page doesn't exist
		if (is404) {
			console.error(
				`The URL ${searchUrl} does not exist. Check your spelling of the game.`,
			);
			return;
		}

		// Wait for the offers table to load
		await page.waitForSelector('.offers-table-row');

		// Filter results to show only PayPal payment options
		await page.evaluate(() => {
			const paypalButton = document.querySelector('.filters-fees.paypal-fees');
			if (paypalButton) {
				paypalButton.click();
				setTimeout(() => {}, 500); // Add delay for filter to apply
			}
		});

		// Wait for filtered results with a 5 second timeout
		await page.waitForSelector('.offers-table-row', { timeout: 5000 });

		// Extract game pricing data from the page
		const gamePrices = await page.evaluate(() => {
			const elements = document.querySelectorAll('.offers-table-row');
			const gamePrices = [];

			// Iterate through each offer row
			for (const element of elements) {
				// Extract merchant name
				const merchantTitle = element
					.querySelector('.x-offer-merchant-name')
					.textContent.trim();

				// Extract price
				const price = element
					.querySelector('.x-offer-buy-btn-in-stock')
					.textContent.trim();

				// Extract discount code if available
				const discountCodeElement = element.querySelector(
					'.x-offer-coupon-code',
				);
				const discountCode = discountCodeElement
					? discountCodeElement.textContent.trim()
					: null;

				// Extract merchant link
				const merchantLink = element
					.querySelector('.x-offer-buy-btn')
					.getAttribute('href');

				// Convert price to number for sorting (remove £ symbol)
				const priceToSort = Number.parseFloat(price.replace('£', '')).toFixed(
					2,
				);

				// Add all extracted data to array
				gamePrices.push({
					merchantTitle,
					price,
					priceToSort,
					discountCode,
					merchantLink,
				});
			}

			return gamePrices;
		});

		// Sort prices from lowest to highest
		gamePrices.sort((a, b) => a.priceToSort - b.priceToSort);

		// Clean up by closing the browser
		await browser.close();
		console.log(gamePrices);
	} catch (error) {
		console.error('An error occurred:', error);
	}
};

scrapeAllkeyshop('core keeper');
