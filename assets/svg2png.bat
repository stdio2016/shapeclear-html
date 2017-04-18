rem set this to the location of Inkscape
set inkscape="C:\Program Files\Inkscape\inkscape.exe"

cd %~dp0
cd shapes
for %%f in (*.svg) do %inkscape% -e %%~nf.png %%f
for %%f in (*Stripe.png) do del %%f
cd ..

cd number
for %%f in (*.svg) do %inkscape% -e %%~nf.png %%f