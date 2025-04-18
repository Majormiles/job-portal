# PowerShell script to run the API test

param(
    [Parameter(Mandatory=$true)]
    [string]$adminToken
)

Write-Host "Running API test with admin token: $adminToken"

# Change to the frontend directory
Set-Location -Path "$PSScriptRoot"

# Run the test with the provided token
node src/scripts/testAPI.cjs $adminToken 