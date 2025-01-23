FROM node:22.6.0-bookworm-slim 

RUN apt-get update && apt-get -y install vim git tzdata locales procps && apt-get clean && rm -rf /var/lib/apt/lists/* && ln -fs /usr/share/zoneinfo/Europe/Prague /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata && sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && locale-gen

RUN npm install -g pnpm

COPY --chown=1000:1000 framework /opt/fumadocs

USER 1000
WORKDIR /opt/fumadocs
RUN pnpm i

#COPY framework.old/packages/ui/dist/layouts/docs/* /opt/fumadocs/node_modules/fumadocs-ui/dist/layouts/docs/
