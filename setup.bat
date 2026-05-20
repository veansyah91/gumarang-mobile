@echo off
cd /d c:\External\Projects\laragon\www\gumarang-mobile
if not exist "app\(app)\gold-list" mkdir "app\(app)\gold-list"
node create-gold-detail.js
pause
