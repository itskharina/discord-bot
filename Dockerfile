FROM ghcr.io/puppeteer/puppeteer:19.7.0

USER root

# Set Node options for memory
ENV NODE_OPTIONS="--max-old-space-size=512"

# Copy your application files
COPY . .

# Install dependencies
RUN npm install

# Set environment variable for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Add additional Puppeteer configurations
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_DISABLE_DEV_SHM_USAGE=true

# Switch back to pptruser
USER pptruser

# Start your bot
CMD ["node", "index.js"]