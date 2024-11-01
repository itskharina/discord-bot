class RateLimiter {
	constructor(maxRequests, timeWindow) {
		// Maximum number of requests allowed in the time window
		this.maxRequests = maxRequests;
		// Time window in milliseconds
		this.timeWindow = timeWindow;
		// Array to store timestamp of each request
		this.requests = [];
	}

	async waitForToken() {
		const now = Date.now();
		// Remove old requests that are outside the current time window
		this.requests = this.requests.filter(
			(time) => time > now - this.timeWindow,
		);

		// If the number of requests has reached the maximum allowed
		if (this.requests.length >= this.maxRequests) {
			// Wait until the oldest request expires
			const oldestRequest = this.requests[0];
			// Calculate the wait time by subtracting the time window from the oldest request timestamp
			const waitTime = oldestRequest - (now - this.timeWindow);
			// Wait for the calculated wait time before resolving the promise
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}

		// Add current request timestamp to the array
		this.requests.push(now);
	}
}

module.exports = RateLimiter;
