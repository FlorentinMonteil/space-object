
#! /bin/sh

INPUT=src/assets/images/milky-way.jpg
OUTDIR=src/assets/images/exported-dark/
SIZE=1024
TMPDIR=./tmp

mkdir $OUTDIR

cmft --input $INPUT \
     --outputNum 1 \
     --dstFaceSize $SIZE \
     --output0 $TMPDIR/cube \
     --output0params tga,bgr8,facelist

mogrify -flip -flop $TMPDIR/cube_posy.tga
mogrify -flip -flop $TMPDIR/cube_negy.tga

PVRTexToolCLI -cube -legacypvr -q pvrtcbest -f PVRTC1_2_RGB,UBN,lRGB -o $OUTDIR/tex.pvr -i \
$TMPDIR/cube_negx.tga,\
$TMPDIR/cube_posy.tga,\
$TMPDIR/cube_negz.tga,\
$TMPDIR/cube_posx.tga,\
$TMPDIR/cube_negy.tga,\
$TMPDIR/cube_posz.tga \


PVRTexToolCLI -cube -q etcslowperceptual -f ETC1,UBN,lRGB -o $OUTDIR/tex.ktx -i \
$TMPDIR/cube_negx.tga,\
$TMPDIR/cube_posy.tga,\
$TMPDIR/cube_negz.tga,\
$TMPDIR/cube_posx.tga,\
$TMPDIR/cube_negy.tga,\
$TMPDIR/cube_posz.tga \

convert $TMPDIR/cube_negx.tga $OUTDIR/negx.jpg
convert $TMPDIR/cube_negy.tga $OUTDIR/posy.jpg
convert $TMPDIR/cube_negz.tga $OUTDIR/negz.jpg
convert $TMPDIR/cube_posx.tga $OUTDIR/posx.jpg
convert $TMPDIR/cube_posy.tga $OUTDIR/negy.jpg
convert $TMPDIR/cube_posz.tga $OUTDIR/posz.jpg



rm -rf $TMPDIR/cube_*.tga

nvcompress -nomips -bc1 $OUTDIR/tex.jpg.dds $OUTDIR/tex.dds
rm -rf $OUTDIR/tex.jpg.dds