#!/bin/sh

type="patch"
if [[ "$1" != "" ]]; then
  type=$1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "master" ]]; then
  echo 'Checkout to master branch!';
  exit 1;
fi

version=$(npm version $type --no-git-tag-version)

git add package*.json
git commit -m "release-$version"

git tag $version
git push origin --tags