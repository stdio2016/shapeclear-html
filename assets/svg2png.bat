@echo off
rem set this to the location of Inkscape
set inkscape="C:\Users\User\Documents\Programs\Inkscape\inkscape.exe"

cd %~dp0

cd shapes
echo 1. Convert shapes
call :svg2png
for %%f in (*Stripe.png) do del %%f
cd ..

cd number
echo 2. Convert number
call :svg2png
cd ..

cd ui
echo 3. Convert ui
call :svg2png
cd ..

goto :eof

:svg2png
for %%f in (*.svg) do echo -e %%~nf.png %%f >> tmp.txt
echo quit >> tmp.txt
type tmp.txt | %inkscape% --shell
del tmp.txt
goto :eof
