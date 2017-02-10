@echo off
rem Set this to the location of LibGDX texture packer
set TexturePacker=C:\Users\User\Documents\Programs\runnable-texturepacker.jar
rem Set this to the location of Python 2.7.x
set Python=C:\Python27\python.exe

rem I prefer %here% over %~dp0
set here=%~dp0

echo 1. Packing texture
java -jar %TexturePacker%  %here%/assets/shapes %here%/img shapes %here%/textureSettings.json
echo 2. Convert format
%python% %here%/atlasConvert.py %here%/img/shapes_big.atlas > %here%/img/shapes_big.json
%python% %here%/atlasConvert.py %here%/img/shapes_small.atlas > %here%/img/shapes_small.json
pause
