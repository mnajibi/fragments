# Stage 1: Dependencies
FROM node:20.13.0@sha256:a6385a6bb2fdcb7c48fc871e35e32af8daaa82c518900be49b76d10c005864c2 AS dependencies

LABEL maintainer="Maryam Najibi <snajibi@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Use /app as our working directory
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Copy the package.json and package-lock.json files to the current working directory
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Stage 2: Application
FROM node:20.13.0@sha256:a6385a6bb2fdcb7c48fc871e35e32af8daaa82c518900be49b76d10c005864c2 AS app

LABEL maintainer="Maryam Najibi <snajibi@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Use /app as our working directory
WORKDIR /app

# Copy application source code
COPY --chown=node:node src/ src/
COPY --chown=node:node ./tests/.htpasswd ./tests/.htpasswd

# Copy the dependencies from the previous stage
COPY --chown=node:node --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=dependencies /app/package*.json ./


# Define the default port
ENV PORT=80

# Healthcheck to ensure the application is running
HEALTHCHECK --interval=15s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT} || exit 1

# Expose the port
EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]
