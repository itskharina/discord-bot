FROM ghcr.io/puppeteer/puppeteer:19.7.0

USER root

# Copy your application files
COPY . .

# Install dependencies
RUN npm install

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Switch back to pptruser (puppeteer's user)
USER pptruser

# Start your bot
CMD ["node", "index.js"]