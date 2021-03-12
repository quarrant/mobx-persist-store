#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "master" ]]; then
  echo 'Checkout to master branch!';
  exit 1;
fi

version=$(npm version patch --no-git-tag-version)

git add package*.json
git commit -m "release-$version"

git tag $version
git push origin --tags