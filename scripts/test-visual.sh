#!/bin/sh
# Runs the visual specs inside the official Playwright Docker image, where the
# baselines in e2e/visual/baselines/ were rendered. Extra arguments go to
# Playwright, e.g. `npm run test:visual -- --update-snapshots`.
set -eu

# The image tag follows the installed Playwright, so the browser always matches
# the test runner (package.json pins one exact version).
version=$(node -p "require('@playwright/test/package.json').version")

# --platform linux/amd64: the CI runners are amd64, and text may rasterize
#   differently on arm64. On Apple Silicon this runs under emulation, so the
#   first run (image pull and npm ci) takes several minutes.
# -v /work/node_modules: an anonymous volume keeps the container's Linux
#   modules apart from the host's, which hold native binaries for the host OS.
# --ipc=host: recommended by Playwright so Chromium does not run out of shared memory.
docker run --rm --platform linux/amd64 --ipc=host \
  -v "$PWD":/work -v /work/node_modules -w /work \
  "mcr.microsoft.com/playwright:v$version-noble" \
  sh -c 'npm ci --no-audit --no-fund && npx playwright test --project=visual "$@"' -- "$@"
