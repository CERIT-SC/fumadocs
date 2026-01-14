#!/bin/bash
set -euo pipefail

# Validate parameters
if [ $# -ne 1 ]; then
    echo "Error: Commit message is required"
    echo "Usage: $0 \"Your commit message\""
    exit 1
fi
commit_message="$1"

# Check required files
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

# Extract version
version=$(grep -E '"fumadocs-core"' package.json | \
          sed -E 's/.*"fumadocs-core":\s*"([^"]+)".*/\1/' )

[ -z "$version" ] && { echo "Error: fumadocs-core version not found"; exit 1; }

# Clean version
clean_version=$(echo "$version" | sed -E 's/[~^>=<]+//g')

# Validate version format
[[ "$clean_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+ ]] || { 
    echo "Error: Invalid version format '$clean_version'"; exit 1;
}

# Git operations
git add -A
git commit -m "$commit_message"
git tag -a "v${clean_version}" -m "Release v${clean_version}"
git push
git push --atomic origin HEAD "v${clean_version}"

# GitHub Release creation
if command -v gh &> /dev/null; then
    echo "Creating GitHub release..."
    gh release create "v${clean_version}" --title "Release v${clean_version}" \
        --notes "Release notes ${commit_message}"
    echo "GitHub release created: https://github.com/CERIT-SC/fumadocs/releases/tag/v${clean_version}"
else
    echo -e "\nGitHub CLI not installed. Release page not created."
    echo "To create release manually:"
    echo "  1. Go to: https://github.com/your-user/your-repo/releases/new"
    echo "  2. Select tag 'v${clean_version}'"
    echo "  3. Add release notes"
fi
