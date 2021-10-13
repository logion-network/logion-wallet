#!/bin/sh

set -e

/usr/docker/wait-for-it.sh $NODE_HOST_PORT
/usr/docker/wait-for-it.sh $BACKEND_HOST_PORT

# Run the main container command.
exec "$@"
