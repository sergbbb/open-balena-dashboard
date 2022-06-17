FROM node:12.22.0-stretch

ARG OPENBALENA_DOMAIN

ENV APP_ROOT /app

WORKDIR ${APP_ROOT}

COPY package*.json ./

RUN npm install --quiet

COPY . .

RUN ["wget", "https://github.com/balena-io/balena-cli/releases/download/v12.44.14/balena-cli-v12.44.14-linux-x64-standalone.zip"]
RUN ["unzip", "-o", "balena-cli-v12.44.14-linux-x64-standalone.zip"]
RUN ["chmod", "+x", "./balena-cli/balena"]

RUN echo "resinUrl: \"${OPENBALENA_DOMAIN}\"" > /root/.resinrc.yml
RUN echo "balenaUrl: \"${OPENBALENA_DOMAIN}\"" > /root/.balenarc.yml


COPY ./api/ca.crt /usr/local/share/ca-certificates/ca.crt
CMD [ "update-ca-certificates" ]

ENV PATH="/app/balena-cli:${PATH}"
ENV NODE_EXTRA_CA_CERTS /usr/local/share/ca-certificates/ca.crt
ENV HOST 0.0.0.0

EXPOSE 3000
