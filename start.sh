#!/bin/bash

git remote update

UPSTREAM=${1:-'@{u}'}
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "$UPSTREAM")
BASE=$(git merge-base @ "$UPSTREAM")

export NODE_ENV="production"

if [ $LOCAL = $REMOTE ]; then
   echo "Latest files in repository"
elif [ $LOCAL = $BASE ]; then
   echo 'Start updated files from git'
   git reset --hard HEAD
   git pull
   npm install
   npm run build
elif [ $REMOTE = $BASE ]; then
    echo "Local files has been changed!"
else
    echo "Unknown status"
fi

npm run start
