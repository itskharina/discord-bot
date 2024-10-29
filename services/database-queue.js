class DatabaseQueue {
	constructor() {
		// Queue to store pending database operations
		this.queue = [];
		// Flag to prevent concurrent processing
		this.isProcessing = false;
	}

	async add(operation) {
		// Return a promise that resolves when the operation completes
		return new Promise((resolve, reject) => {
			// Add the operation to the queue with its resolve/reject callbacks
			this.queue.push({ operation, resolve, reject });
			// Trigger processing of the queue
			this.processQueue();
		});
	}

	async processQueue() {
		// Skip if already processing or queue is empty
		if (this.isProcessing || this.queue.length === 0) return;

		// Set processing flag to prevent concurrent processing
		this.isProcessing = true;
		// Get next operation from queue
		const { operation, resolve, reject } = this.queue.shift();

		try {
			// Execute the operation and resolve the promise
			const result = await operation();
			resolve(result);
		} catch (error) {
			reject(error);
		} finally {
			// Reset processing flag and continue processing the queue
			this.isProcessing = false;
			this.processQueue();
		}
	}
}

module.exports = new DatabaseQueue();
