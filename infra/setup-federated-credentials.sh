#!/usr/bin/env bash
# Sets up the federated identity credentials on the Azure service principal
# so that GitHub Actions OIDC login (azure/login@v2) works without a client secret.
#
# Prerequisites:
#   - Azure CLI installed and logged in (az login)
#   - Sufficient permissions to create federated credentials on the service principal
#     (Application Administrator or Owner of the app registration)
#
# Usage:
#   ./infra/setup-federated-credentials.sh <SERVICE_PRINCIPAL_APP_ID>
#
# Example:
#   ./infra/setup-federated-credentials.sh 00000000-0000-0000-0000-000000000000

set -euo pipefail

APP_ID="${1:-}"

if [[ -z "$APP_ID" ]]; then
  echo "ERROR: SERVICE_PRINCIPAL_APP_ID is required." >&2
  echo "Usage: $0 <SERVICE_PRINCIPAL_APP_ID>" >&2
  exit 1
fi

REPO="OveRonny/flowProgorb"
ISSUER="https://token.actions.githubusercontent.com"
AUDIENCE="api://AzureADTokenExchange"

CREDENTIAL_NAMES=(
  "github-actions-production"
  "github-actions-staging"
)
CREDENTIAL_SUBJECTS=(
  "repo:${REPO}:environment:production"
  "repo:${REPO}:environment:staging"
)

echo "Configuring federated identity credentials for app '${APP_ID}'..."

for i in "${!CREDENTIAL_NAMES[@]}"; do
  NAME="${CREDENTIAL_NAMES[$i]}"
  SUBJECT="${CREDENTIAL_SUBJECTS[$i]}"

  # Check if the credential already exists
  EXISTING=$(az ad app federated-credential list \
    --id "$APP_ID" \
    --query "[?name=='${NAME}'].name" \
    --output tsv 2>/dev/null || true)

  if [[ -n "$EXISTING" ]]; then
    echo "  Federated credential '${NAME}' already exists – skipping."
  else
    echo "  Creating federated credential '${NAME}' (subject: ${SUBJECT})..."
    az ad app federated-credential create \
      --id "$APP_ID" \
      --parameters "{
        \"name\": \"${NAME}\",
        \"issuer\": \"${ISSUER}\",
        \"subject\": \"${SUBJECT}\",
        \"audiences\": [\"${AUDIENCE}\"],
        \"description\": \"GitHub Actions OIDC login for ${SUBJECT}\"
      }"
    echo "  Done."
  fi
done

echo "All federated identity credentials are configured."
