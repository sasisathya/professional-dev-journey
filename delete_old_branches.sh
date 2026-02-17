#!/bin/bash

# Get current git user email
USER_EMAIL=$(git config user.email)
USER_NAME=$(git config user.name)

echo "Finding branches created by: $USER_NAME <$USER_EMAIL>"
echo "Looking for branches older than 4 months..."
echo ""

# Calculate date 4 months ago (macOS version)
if [[ "$OSTYPE" == "darwin"* ]]; then
    CUTOFF_DATE=$(date -v-4m +%Y-%m-%d)
else
    # Linux version
    CUTOFF_DATE=$(date -d "4 months ago" +%Y-%m-%d)
fi

echo "Cutoff date: $CUTOFF_DATE"
echo ""
echo "=== LOCAL BRANCHES ==="

# Find local branches created by current user and older than 4 months
git for-each-ref --format='%(committerdate:short)|%(committeremail)|%(refname:short)' refs/heads/ | \
while IFS='|' read -r date email branch; do
    if [[ "$email" == "<$USER_EMAIL>" ]] && [[ "$date" < "$CUTOFF_DATE" ]] && [[ "$branch" != "main" ]] && [[ "$branch" != "master" ]]; then
        echo "Branch: $branch (created: $date)"
        echo "  Would delete with: git branch -D $branch"
    fi
done

echo ""
echo "=== REMOTE BRANCHES (origin) ==="

# Find remote branches created by current user and older than 4 months
git for-each-ref --format='%(committerdate:short)|%(committeremail)|%(refname:short)' refs/remotes/origin/ | \
while IFS='|' read -r date email branch; do
    remote_branch=$(echo "$branch" | sed 's/origin\///')
    if [[ "$email" == "<$USER_EMAIL>" ]] && [[ "$date" < "$CUTOFF_DATE" ]] && [[ "$remote_branch" != "main" ]] && [[ "$remote_branch" != "master" ]] && [[ "$remote_branch" != "HEAD" ]]; then
        echo "Branch: $remote_branch (created: $date)"
        echo "  Would delete with: git push origin --delete $remote_branch"
    fi
done

echo ""

# Check if --execute flag is provided
if [[ "$1" == "--execute" ]]; then
    echo "=== EXECUTING DELETIONS ==="
    echo ""

    # Delete local branches
    echo "Deleting local branches..."
    git for-each-ref --format='%(committerdate:short)|%(committeremail)|%(refname:short)' refs/heads/ | \
    while IFS='|' read -r date email branch; do
        if [[ "$email" == "<$USER_EMAIL>" ]] && [[ "$date" < "$CUTOFF_DATE" ]] && [[ "$branch" != "main" ]] && [[ "$branch" != "master" ]]; then
            echo "Deleting local branch: $branch"
            git branch -D "$branch"
        fi
    done

    echo ""
    echo "Deleting remote branches..."
    # Delete remote branches
    git for-each-ref --format='%(committerdate:short)|%(committeremail)|%(refname:short)' refs/remotes/origin/ | \
    while IFS='|' read -r date email branch; do
        remote_branch=$(echo "$branch" | sed 's/origin\///')
        if [[ "$email" == "<$USER_EMAIL>" ]] && [[ "$date" < "$CUTOFF_DATE" ]] && [[ "$remote_branch" != "main" ]] && [[ "$remote_branch" != "master" ]] && [[ "$remote_branch" != "HEAD" ]]; then
            echo "Deleting remote branch: $remote_branch"
            git push origin --delete "$remote_branch"
        fi
    done

    echo ""
    echo "=== DELETION COMPLETE ==="
else
    echo "=== DRY RUN COMPLETE ==="
    echo "To actually delete these branches, run with --execute flag"
    echo "Usage: $0 --execute"
fi
