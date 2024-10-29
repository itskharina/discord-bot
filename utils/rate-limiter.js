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
		// Remove old requests
		this.requests = this.requests.filter(
			(time) => time > now - this.timeWindow,
		);

		if (this.requests.length >= this.maxRequests) {
			// Wait until the oldest request expires
			const oldestRequest = this.requests[0];
			const waitTime = oldestRequest - (now - this.timeWindow);
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}

		// Add current request timestamp
		this.requests.push(now);
	}
}

module.exports = RateLimiter;
