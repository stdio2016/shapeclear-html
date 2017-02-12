# Set this to the location of LibGDX texture packer
TexturePacker=runnable-texturepacker.jar
# Set this to the location of Python 2.7.x
Python=python

here=`dirname $0`
cd $here

# Linux equivalent to Windows pause
function pause {
  echo Press any key to continue . . .
  read -rsn 1
  read -rst 0.01
}

echo 1. Packing texture
java -jar $TexturePacker  assets/shapes img shapes textureSettings.json
echo 2. Convert format
$Python atlasConvert.py img/shapes_big.atlas > img/shapes_big.json
$Python atlasConvert.py img/shapes_small.atlas > img/shapes_small.json
pause
