#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT=$(cd -- "${SCRIPT_DIR}/../.." && pwd)
LOG_DIR="${PROJECT_ROOT}/logs/clone-deploy"
IMAGE_NAME="${IMAGE_NAME:-newbee-ui:local}"
mkdir -p "${LOG_DIR}"
docker build "${PROJECT_ROOT}" -f "${SCRIPT_DIR}/Dockerfile" -t "${IMAGE_NAME}" 2>&1 | tee "${LOG_DIR}/docker-build.log"
printf "Built %s\n" "${IMAGE_NAME}"
