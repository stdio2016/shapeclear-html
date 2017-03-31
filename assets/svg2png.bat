rem set this to the location of Inkscape
set inkscape="C:\Program Files\Inkscape\inkscape.exe"

cd %~dp0
cd shapes
for %%f in (*.svg) do %inkscape% -e %%~nf.png %%f
