#!/usr/bin/env bash
set -euo pipefail

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"
echo ""
echo "Select version bump:"
echo "  1) patch"
echo "  2) minor"
echo "  3) major"
echo ""
read -p "Choose (1/2/3): " -r CHOICE

case "$CHOICE" in
  1) VERSION_BUMP="patch" ;;
  2) VERSION_BUMP="minor" ;;
  3) VERSION_BUMP="major" ;;
  *) echo "Invalid choice."; exit 1 ;;
esac

# Ensure working directory is clean
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working directory is not clean. Commit or stash changes first."
  exit 1
fi

echo "Running type checks..."
npm run typecheck

echo "Running tests..."
npm test

echo "Building..."
npm run build

echo "Bumping version ($VERSION_BUMP)..."
NEW_VERSION=$(npm version "$VERSION_BUMP" --no-git-tag-version)
echo "New version: $NEW_VERSION"

echo ""
echo "Publishing dry run:"
npm publish --dry-run

echo ""
read -p "Publish $NEW_VERSION to npm? (y/N) " -r
if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
  echo "Aborted. Reverting version bump..."
  git checkout package.json package-lock.json
  exit 1
fi

npm publish

git add package.json package-lock.json
git commit -m "release: $NEW_VERSION"
git tag "$NEW_VERSION"

echo ""
echo "Published $NEW_VERSION"
echo "Run 'git push && git push --tags' to push the release."
