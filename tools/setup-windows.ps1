$ErrorActionPreference = "Stop"

$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if($currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) -eq $false)
{
    Write-Error "The script must be executed as administrator"
    Exit 1
}

. choco install sops
. choco install gpg4win
. choco install kubernetes-helm
. helm plugin install https://github.com/jkroepke/helm-secrets

# Import GPG keys
Get-ChildItem "$PSScriptRoot\keys" -Filter *.asc | 
Foreach-Object {
    . gpg --import $_.FullName
}