###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:16-alpine As development

RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl1.1-compat-dev

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package*.json ./

# Install app dependencies using the `yarn` command 
RUN yarn config set unsafe-perm true
RUN yarn global add typescript
RUN yarn global add ts-node
RUN yarn

# Bundle app source
COPY --chown=node:node . .
COPY prisma /usr/src/app/prisma
RUN npx prisma generate
RUN yarn run build

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:16-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/prisma ./prisma
COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN yarn run build
RUN chown -R root:root *

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN yarn install --production --frozen-lockfile && yarn cache clean

USER node

###################
# PRODUCTION
###################

FROM node:16-alpine As production
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl1.1-compat-dev

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/build ./dist

# Start the server using the production build
CMD [ "node", "build/src/main.js" ]