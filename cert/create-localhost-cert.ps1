function get-localhost-conf {
    param (
        [string]$path = "."
    )

    Write-Host "Creating localhost.conf..." -NoNewLine
    $confContent = @"
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = UA
ST = Ukraine
L = Kyiv
O = Development
OU = Development
CN = localhost

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
"@

    $confFile = Join-Path -Path $path -ChildPath "localhost.conf"

    try {
        $confContent | Out-File -FilePath $confFile -Encoding UTF8
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed" -ForegroundColor Red
    }
}

function create-localhost-cert {
    param (
        [string]$Name = "cert",
        [string]$Key = "key",
        [switch]$Import,
        [switch]$Admin,
        [switch]$Verbose
    )

    Write-Host " "

    # Check if openssl is installed
    if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
        Write-Host "OpenSSL is not installed or not found in PATH." -ForegroundColor Red
        return
    }

    # Create localhost.conf
    if (-not (Test-Path -Path "./localhost.conf")) {
        get-localhost-conf
    }

    # Generate a self-signed certificate for localhost 
    Write-Host "Generating certificate and key files..." -NoNewLine
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout "$Key.pem" -out "$Name.pem" -config localhost.conf -extensions v3_req 2>&1 | Out-Null

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed" -ForegroundColor Red
        return
    }

    Write-Host "OK" -ForegroundColor Green

    Write-Host "Certificate and private key created successfully!" -ForegroundColor Green
    
    if (-not $Import) {
        Write-Host " "
        return
    }

    Write-Host "Importing certificate to certificate store..."
    
    # Check if running as administrator
    $currentUserIsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    try {
        if ($Admin -and $currentUserIsAdmin) {
            # Method 1: Using Import-Certificate cmdlet for system store
            Write-Host "Importing to system certificate store using Import-Certificate..." -ForegroundColor Yellow
            Import-Certificate -FilePath "$Name.pem" -CertStoreLocation Cert:\LocalMachine\Root -Verbose:$Verbose
            Write-Host "Certificate imported successfully to system Trusted Root Certification Authorities." -ForegroundColor Green
            
        } elseif ($Admin -and -not $currentUserIsAdmin) {
            Write-Host "Admin import requested but PowerShell is not running as Administrator." -ForegroundColor Red
            Write-Host "Please restart PowerShell as Administrator or remove -Admin parameter." -ForegroundColor Yellow
            return            
        } else {
            # Method 2: Using Import-Certificate cmdlet for current user
            Write-Host "Importing to current user certificate store using Import-Certificate..." -ForegroundColor Yellow
            Import-Certificate -FilePath "$Name.pem" -CertStoreLocation Cert:\CurrentUser\Root -Verbose:$Verbose
            Write-Host "Certificate imported successfully to current user Trusted Root Certification Authorities." -ForegroundColor Green
            
            if (-not $Admin) {
                Write-Host "Note: Use -Admin parameter and run as Administrator for system-wide trust." -ForegroundColor Cyan
            }
        }
        
    } catch {
        # Fallback to manual .NET method if Import-Certificate fails
        Write-Host "Import-Certificate failed, trying alternative method..." -ForegroundColor Yellow
        
        $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
        $cert.Import("$Name.pem")

        if ($Admin -and $currentUserIsAdmin) {
            $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
        } else {
            $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "CurrentUser")
        }
        
        $store.Open("ReadWrite")
        $store.Add($cert)
        $store.Close()
        Write-Host "Certificate imported successfully using fallback method." -ForegroundColor Green
    }

    Write-Host " "
}

create-localhost-cert -Import