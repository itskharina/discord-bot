async function retry(fn, retries = 3, delay = 1000, increaseFactor = 2) {
	try {
		return await fn();
	} catch (error) {
		// If no more retries left, throw the final error
		if (retries === 0) throw error;

		// Wait for the specified delay before retrying
		await new Promise((resolve) => setTimeout(resolve, delay));

		// Recursively retry with one less attempt and increased delay
		return retry(fn, retries - 1, delay * increaseFactor);
	}
}

module.exports = retry;
