#!/bin/sh

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "master" ]]; then
  echo 'Checkout to master branch!';
  exit 1;
fi

VERSION=$(npm version patch --no-git-tag-version)

git checkout -b release-$VERSION
git add package*.json

git commit -m "release-$VERSION"
git push -u origin release-$VERSION