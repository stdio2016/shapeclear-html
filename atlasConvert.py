# Wow! This is my first Python program
# It can convert LibGDX texture atlas format to Phaser format
# Created 2017/02/10
# author: stdio2016
import sys

def checkHead(file):
    for i in range(6):
        file.readline()

def readFrame(file, isFirst):
    frameName = file.readline()
    if len(frameName) == 0:
        return None
    rotate = readKey(file, 'rotate')
    xy = getCoord(readKey(file, 'xy'))
    size = getCoord(readKey(file, 'size'))
    orig = getCoord(readKey(file, 'orig'))
    offset = getCoord(readKey(file, 'offset'))
    index = int(readKey(file, 'index'))
    frameName = frameName[0:-1]
    if index != -1:
        frameName = frameName + '_' + str(index)
    if isFirst:
        print ('{')
    else:
        print (',{')
    print ('\t"filename": "%s",' % escape(frameName))
    print ('\t"frame": {"x":%d,"y":%d,"w":%d,"h":%d},' % (
        xy[0], xy[1], size[0], size[1]))
    print ('\t"rotated": %s,' % rotate)
    print ('\t"trimmed": %s,' % ('false' if size == orig else 'true'))
    print ('\t"spriteSourceSize": {"x":%d,"y":%d,"w":%d,"h":%d},' % (
        offset[0], offset[1], size[0], size[1]))
    print ('\t"sourceSize": {"w":%d,"h":%d}' % orig)
    print ('}')
    return True

def escape(str):
    str = str.replace('\\', '\\\\')
    str = str.replace('"', '\\"')
    return str

def readKey(file, key):
    str = file.readline()
    str = str.strip()
    colon = str.find(': ')
    if colon == -1:
        raise SyntaxError("Missing colon")
    theKey = str[0:colon]
    if theKey != key:
        raise SyntaxError("Key %s mismatch" % key)
    return str[colon+1:].lstrip()

def getCoord(str):
    x, y = str.split(', ')
    return (int(x), int(y))

def main():
    if len(sys.argv) < 2:
        print ("usage: python atlasConvert.py <libgdx atlas file>")
        sys.exit()
    inName = sys.argv[1]
    f = open(inName)
    checkHead(f)
    notEnd = True
    isFirst = True
    print ('{"frames": [')
    while notEnd:
        data = readFrame(f, isFirst)
        if data is None:
            notEnd = False
        isFirst = False
    f.close()
    print ('''],
\t"meta": {
\t\t"app": "atlasConvert.py and LibGDX texture packer",
\t\t"version": "0.1"
\t}
}''')

main()
