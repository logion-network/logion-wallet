#!/bin/bash
# This script generates a new version.json file incremeted version and new release notes.

if [ -z "$1" ]
then
    echo "Missing release notes"
    exit 1
fi

CHANGES=$(git status -s)
if [ ! -z "$CHANGES" ]
then
    echo "Commit your changes first"
    exit 1
fi

VERSION=$(cat public/version.json | jq '.version' )

let NEXT_VERSION=VERSION+1

VERSION_JSON='{
    "version": '$NEXT_VERSION',
    "releaseNotes": "'$1'"
}
'
echo -n "$VERSION_JSON" > public/version.json

VERSION_TS='export const VERSION = '$NEXT_VERSION';'
echo "$VERSION_TS" > src/version/version.ts

git commit -am "chore: pre-release."
