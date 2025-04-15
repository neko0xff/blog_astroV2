---
title: Windows-大量新增使用者且加入群組
pubDatetime: 2023-09-16 10:58:51
tags:
  - "工科賽"
  - "Windows"
  - "Windows Server"
description: ""
---

## 00 緒論

若不想要手動一個個進行建立使用者，則可選擇寫一個批次檔來處理大量建立使用者的部分。

<table><tr><td bgcolor=0000FF>
  <font color=white>請先建好相對的群組:ITGroups,RDGroups,FeGroups</font>
</td></tr></table>

<!--more-->

## 01 cmd+bat

### 1-1 建立批次檔

- IT.bat

```bat
For /L %%a in (1,1,9) do dsadd user "cn=IT0%%a,cn=Users,dc=sivs2020,dc=edu" -samid IT0%%a -email IT0%%a@sivs2020.edu -pwd IT@2020
For /L %%a in (10,1,10) do dsadd user "cn=IT%%a,cn=Users,dc=sivs2020,dc=edu" -samid IT%%a -email IT%%a@sivs2020.edu -pwd IT@2020
```

- RD.bat

```bat
For /L %%a in (1,1,9) do dsadd user "cn=RD0%%a,cn=Users,dc=sivs2020,dc=edu" -samid RD0%%a -email RD0%%a@sivs2020.edu -pwd RD@2020
For /L %%a in (10,1,50) do dsadd user "cn=RD%%a,cn=Users,dc=sivs2020,dc=edu" -samid RD%%a -email RD%%a@sivs2020.edu -pwd RD@2020
```

- Feusr.bat

```bat
For /L %%a in (1,1,9) do dsadd user "cn=Feusr0%%a,cn=Users,dc=sivs2020,dc=edu" -samid Feusr0%%a -email Feusr0%%a@sivs2020.edu -pwd Fedora@2020
For /L %%a in (10,1,50) do dsadd user "cn=Feusr%%a,cn=Users,dc=sivs2020,dc=edu" -samid Feusr%%a -email Feusr%%a@sivs2020.edu -pwd Fedora@2020
```

## 02 powershell

### 2-1 建立批次檔

- IT.ps1

```powershell
$path="CN=Users,DC=sivs2020,DC=edu"
$d="sivs2020.edu"
$u="IT"
$p="IT@2020"
$g="ITGroups"
$count=1..10
foreach($i in $count){
   $j=$i.ToString("00")
   New-AdUser -Name "$u$j" -SamAccountName "$u$j" -UserPrincipalName "$u$j@$d" -EmailAddress "$u$j@$d" -Path $path -Enabled $Ture -ChangePasswordAtLogon $false -PasswordNeverExpires $true -AccountPassword (ConvertTo-SecureString "$p" -AsPlainText -force)
   Add-ADGroupMember -Identity "$g" -Members "$u$j"
}
```

- RD.ps1

```powershell
$path="CN=Users,DC=sivs2020,DC=edu"
$d="sivs2020.edu"
$u="RD"
$p="RD@2020"
$g="RDGroups"
$count=1..50
foreach($i in $count){
   $j=$i.ToString("00")
   New-AdUser -Name "$u$j" -SamAccountName "$u$j" -UserPrincipalName "$u$j@$d" -EmailAddress "$u$j@$d" -Path $path -Enabled $Ture -ChangePasswordAtLogon $false -PasswordNeverExpires $true -AccountPassword (ConvertTo-SecureString "$p" -AsPlainText -force)
   Add-ADGroupMember -Identity "$g" -Members "$u$j"
}
```

- Feusr.ps1

```powershell
$path="CN=Users,DC=sivs2020,DC=edu"
$d="sivs2020.edu"
$u="Feusr"
$p="Fedora@2020"
$g="FeGroups"
$count=1..50
foreach($i in $count){
   $j=$i.ToString("00")
   New-AdUser -Name "$u$j" -SamAccountName "$u$j" -UserPrincipalName "$u$j@$d" -EmailAddress "$u$j@$d" -Path $path -Enabled $Ture -ChangePasswordAtLogon $false -PasswordNeverExpires $true -AccountPassword (ConvertTo-SecureString "$p" -AsPlainText -force)
   Add-ADGroupMember -Identity "$g" -Members "$u$j"
}
```

### 2-2 運行

```
PS D:> powershell -executionpolicy bypass -file IT.ps1
PS D:> powershell -executionpolicy bypass -file RD.ps1
PS D:> powershell -executionpolicy bypass -file Feusr.ps1
```
