@echo off
title Force One
node "%~dp0start.js" %*
if errorlevel 1 pause
