$conflicts = Get-Content .gitconflicts
foreach ($f in $conflicts) {
    Write-Host "Resolving $f"
    git checkout --ours -- "$f"
    git add "$f"
}
$staged = git diff --staged --name-only
if ($staged) {
    git commit -m "Merge origin/main into feature/major — prefer feature/major for conflicts"
} else {
    Write-Host "Nothing to commit"
}
git status --porcelain --untracked-files=no
