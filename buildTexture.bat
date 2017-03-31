@echo off
rem Set this to the location of LibGDX texture packer
set TexturePacker=C:\Users\User\Documents\Programs\runnable-texturepacker.jar
rem Set this to the location of Python 2.7.x
set Python=C:\Python27\python.exe

rem go to the project folder
cd %~dp0

echo 1. Packing texture
java -jar %TexturePacker%  assets/shapes img shapes textureSettings.json
echo 2. Convert format
%python% atlasConvert.py img/shapes_big.atlas > img/shapes_big.json
%python% atlasConvert.py img/shapes_small.atlas > img/shapes_small.json
pause
