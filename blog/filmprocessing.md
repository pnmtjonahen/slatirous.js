## Ion pics2 SD
![](https://images-na.ssl-images-amazon.com/images/I/61LfBAbkOdL._SL1200_.jpg =50%xauto)

### Workflow


- turn the device on
- select correct mode
- load the film in the holder
- slide the holder into the device
- select the frame you want to scan
- press the scan button
- press the enter button
- turn off the device
- take out the sdcard containing the JPG images

And that is it, you now have a SD card with JPG images of your negatives.

## Canon f9000 Mark II flatbed scanner
![](https://images-na.ssl-images-amazon.com/images/I/61I4UkNct1L._SX466_.jpg =50%xauto)


### Workflow

-Step scan the negatives.

```code

scanimage --device-name pixma:04A9190D -p \
        --source='Transparency Unit' \
        --resolution=2400 \
        --format=tiff \
        --mode=Gray -l 78 -x 66  \
        > scanned.tiff

```


I use [scanimage](https://linux.die.net/man/1/scanimage) as the scanning software. With a resolution of 2400dpi. In theis case bigger is not always better. The scanner is able to scan on a higher resolution however the size of the scanned file also becomes bigger.

Format is tiff as I don't want any loss of information.

The mode I use is Gray as my negatives are black and white. So no use of scanning them in color. If however you have a color negative/positive then of course you use Color as the mode.   

-Step is to cut the scanned image in 2 separate slides.

```code
convert scanned.tiff \
    -crop 2500x24000+0+1850 \
    -rotate 90 \
    +repage \
    -negate \
    -flop \
    -monitor \
    scanned_A.tiff

convert scanned.tiff \
    -crop 2500x24000+3710+1850 \
    -rotate 90 \
    +repage \
    -negate \
    -flop \
    -monitor \
    scanned_B.tiff
```

All image manipulation is done with [convert](https://imagemagick.org/script/convert.php).
As the scan contains 2 separate negative slides we need to crop twice once for the left one and once for the right one. The orientation of the scan is also wrong so we rotate the cropped image 90 decrees and flop the image horizontally.
Lastly we negate the image, converting it into a positive image.

The +repage removes metadata.

-Step cut slides into individually images.

```code
slide1='3900x24000+0+0'
slide2='3900x24000+3500+0'
slide3='3900x24000+7000+0'
slide4='3900x24000+10700+0'
slide5='3900x24000+14000+0'
slide6='3900x24000+17600+0'

convert scanned_A.tiff \
    -crop ${side1} \
    +repage \
    -monitor \
    -gamma 0.7 \
    scanned_A_01.tiff
```

A single strip contains at the most 6 images. Again using convert the different images are cut from the slide image. Repeat the command for each of the 6 slides. Do this for both the scanned_A.tiff and scanned_B.tiff files.
When cutting the frames from the slide we adjust it with a gamma of .7 making the images slightly lighter.

There should now be a scanned image, 2 slide images end 36 individually frames.

The frames are the ones that in the next steps are processed.


Bw darktable setup

Color gimp cut and level set

Folder structuren

Starck ip storage

Backup

```code

filename="$(date +%Y-%m-%d_%H%M%S)"
resolution='2400'
format='tiff'

case $1 in
  'color' )
    mode='Color'
  ;;
  'gray' )
    mode='Gray'
  ;;
  'Gray' )
    mode='Gray'
  ;;
  * )
    mode='Gray'
  ;;
esac

# determine the "strip" and single "slide" position and sizes.
case "$resolution" in
    1200)
        strip1='1250x10850+0+925'
        strip2='1250x10850+1855+925'
        ;;
    2400)
        strip1='2500x24000+0+1850'
        strip2='2500x24000+3710+1850'

        slide1='3900x24000+0+0'
        slide2='3900x24000+3500+0'
        slide3='3900x24000+7000+0'
        slide4='3900x24000+10700+0'
        slide5='3900x24000+14000+0'
        slide6='3900x24000+17600+0'
        ;;
    4800)
        strip1='5000x43400+0+3700'
        strip2='5000x43400+7420+3700'
        ;;
esac

# aquire a transparent (aka negative) image from the CanoScan 9000F MarkII
function aquireImage
{
  scanimage --device-name pixma:04A9190D -p \
          --source='Transparency Unit' \
          --resolution=$1 \
          --format=$2 \
          --mode=$3 -l 78 -x 66  \
          > $4
}

# Cut a slide from the aquired image, rotate the slide to face horizontally and negate it (convert from negative to normal print).
function cutSlide
{
  convert $1 \
      -crop $2 \
      -rotate 90 \
      +repage \
      -negate \
      -flop \
      -monitor \
      $3
}

# cut a single frame from the slide and correct its gamma
function cutFrame
{
  convert $1 \
      -crop $2 \
      +repage \
      -monitor \
      -gamma 0.7 \
      $3
}

set -x -e

aquireImage $resolution $format $mode "${filename}.${format}"

cutSlide "${filename}.${format}" $strip1 "${filename}_A.$format"
cutSlide "${filename}.${format}" $strip2 "${filename}_B.$format"

cutFrame "${filename}_A.$format" $slide1 "${filename}_A_01.$format"
cutFrame "${filename}_A.$format" $slide2 "${filename}_A_02.$format"
cutFrame "${filename}_A.$format" $slide3 "${filename}_A_03.$format"
cutFrame "${filename}_A.$format" $slide4 "${filename}_A_04.$format"
cutFrame "${filename}_A.$format" $slide5 "${filename}_A_05.$format"
cutFrame "${filename}_A.$format" $slide6 "${filename}_A_06.$format"

cutFrame "${filename}_B.$format" $slide1 "${filename}_B_01.$format"
cutFrame "${filename}_B.$format" $slide2 "${filename}_B_02.$format"
cutFrame "${filename}_B.$format" $slide3 "${filename}_B_03.$format"
cutFrame "${filename}_B.$format" $slide4 "${filename}_B_04.$format"
cutFrame "${filename}_B.$format" $slide5 "${filename}_B_05.$format"
cutFrame "${filename}_B.$format" $slide6 "${filename}_B_06.$format"
```
