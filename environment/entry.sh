#!/usr/bin/env bash
# set -e

if [ "$1" = 'publish' ]
then

    yarn install
    yarn run build:prod
    npm publish

elif [ "$1" = 'test' ]
then

    yarn install
    yarn run test:watch

elif [ "$1" = 'coverage' ]
then

    yarn install
    yarn run coverage

else

    exec "$@"

fi
