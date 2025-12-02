# use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules and build the app
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# Build the Vite app with production API URL
ENV NODE_ENV=production
ENV VITE_API_URL=http://localhost:3001
RUN bun run build

# copy production dependencies and built files into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/dist dist
COPY --from=prerelease /usr/src/app/package.json .

# Create data directory for persistent storage
RUN mkdir -p /data

# Copy default db.json template
COPY --from=prerelease /usr/src/app/db.json /data/db.json.template

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && chown -R bun:bun /data

# Environment variables
ENV DB_PATH=/data/db.json
ENV VITE_API_URL=http://localhost:3001

# run the app (both JSON Server and Vite preview)
USER bun
EXPOSE 4173/tcp
EXPOSE 3001/tcp

# Use entrypoint script to initialize database, then start servers
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "start"]