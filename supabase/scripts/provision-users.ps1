$ErrorActionPreference = 'Stop'

Write-Host "SIMPER - Provision akun demo Supabase" -ForegroundColor Cyan
$url = Read-Host "Paste Supabase Project URL (https://...supabase.co)"
$secretSecure = Read-Host "Paste Supabase Secret key (sb_secret_...)" -AsSecureString
$passwordSecure = Read-Host "Buat password demo untuk semua akun (minimal 12 karakter)" -AsSecureString

function Convert-ToPlain([Security.SecureString]$secure) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

$secret = Convert-ToPlain $secretSecure
$password = Convert-ToPlain $passwordSecure
if ($password.Length -lt 12) { throw "Password minimal 12 karakter." }

try {
  $env:SUPABASE_URL = $url
  $env:SUPABASE_SECRET_KEY = $secret
  $env:SIMPER_SEED_PASSWORD = $password
  node "$PSScriptRoot\provision-users.mjs"
}
finally {
  Remove-Item Env:SUPABASE_URL -ErrorAction SilentlyContinue
  Remove-Item Env:SUPABASE_SECRET_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:SIMPER_SEED_PASSWORD -ErrorAction SilentlyContinue
  $secret = $null
  $password = $null
}
