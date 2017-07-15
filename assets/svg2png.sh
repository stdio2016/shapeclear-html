inkscape="inkscape"

here=`dirname $0`
cd $here

function svg2png {
  for i in *.svg
  do
    echo $(basename -s .svg $i) | sed 's/./\\\0/g' | sed 's/.*/--file=\0.svg --export-png=\0.png/ ' >> tmp.txt
  done
  echo quit >> tmp.txt
  cat tmp.txt | "$inkscape" --shell
  rm tmp.txt
}

cd shapes
echo 1. Convert shapes
svg2png
cd ..

cd number
echo 2. Convert number
svg2png
cd ..
