## Scanning film

My two ways of scanning film.

!table-of-content

## Ion pics2 SD {#ion}
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

## Canon f9000 Mark II flatbed scanner {#cannon}
![](https://images-na.ssl-images-amazon.com/images/I/61I4UkNct1L._SX466_.jpg =50%xauto)


### Workflow

To scan and initially process my negatives I created a bash script as follows:

See also [](https://www.rigacci.org/wiki/doku.php/doc/appunti/hardware/canoscan_9000f_mark_ii) for more explanation.

-Step define some constants

```code
filename="$(date +%Y-%m-%d_%H%M%S)"
resolution='2400'
format='tiff'
mode='Gray'
```

Define a filename based on the current date and time, makes each scanned image unique and prevents overwriting files.

With a resolution of 2400dpi. In this case bigger is not always better. The scanner is able to scan on a higher resolution, however the size of the scanned file also becomes bigger.

Format is tiff as I don't want to lose any color information.

The mode I use is Gray as my negatives are black and white. So no use of scanning them in color. If however you have a color negative/positive then of course you use Color as the mode.   


-Step scan the negatives.

```code

function aquireImage
{
  scanimage --device-name pixma:04A9190D -p \
          --source='Transparency Unit' \
          --resolution=$1 \
          --format=$2 \
          --mode=$3 -l 78 -x 66  \
          > $4
}

aquireImage $resolution $format $mode "${filename}.${format}"

```

I use [scanimage](https://linux.die.net/man/1/scanimage) as the scanning software. With the source set to 'Transparency Unit' this is the back light in the lid of the scanner. Don't forget to remove the cover or else the scanning will fail.

-Step is to cut the scanned image in 2 separate slides.

```code

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

strip1='2500x24000+0+1850'
strip2='2500x24000+3710+1850'

cutSlide "${filename}.${format}" $strip1 "${filename}_A.$format"
cutSlide "${filename}.${format}" $strip2 "${filename}_B.$format"
```

All image manipulation is done with [convert](https://imagemagick.org/script/convert.php).
As the scan contains 2 separate negative slides we need to crop twice once for the left one and once for the right one. The orientation of the scan is also wrong so we rotate the cropped image 90 decrees and flop the image horizontally.
Lastly we negate the image, converting it into a positive image.

The +repage removes metadata.

-Step cut slides into individually images.

```code
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

slide1='3900x24000+0+0'
slide2='3900x24000+3500+0'
slide3='3900x24000+7000+0'
slide4='3900x24000+10700+0'
slide5='3900x24000+14000+0'
slide6='3900x24000+17600+0'

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

A single strip contains at the most 6 images. Again using convert the different images are cut from the slide image. Repeat the command for each of the 6 slides. Do this for both the scanned_A.tiff and scanned_B.tiff files.
When cutting the frames from the slide we adjust it with a gamma of .7 making the images slightly lighter.

There should now be a scanned image, 2 slide images end 36 individually frames.

The frames are the ones that in the next steps are processed.

## Darktable

Image processing and cataloging is done with [darktable](https://www.darktable.org/)
Each frame still is bigger than the actual photo, when cutting the slides a margin is taken into account. With darktable I'll crop, rotate and adjust the color levels in a way I feel is correct.

When adjusting color levels keep in mind that if we have a black or white border this is also taken into account. See the color curve to find out if extra black or white spikes are there. If needed crop the image some more.

## Gimp

Another application I use when darktable does not give me the correct result is [gimp](https://www.gimp.org/).

Cropping images with gimp is easy, especially if you make a tool preset.

```code
# GIMP tool preset file

(stock-id "gimp-center")
(name "135 mm frame select @2400")
(tool-options "GimpRectangleSelectOptions"
    (aspect-denominator 2228.000000)
    (aspect-numerator 3384.000000)
    (desired-fixed-size-height 2228.000000)
    (desired-fixed-size-width 3384.000000)
    (fixed-rule size)
    (fixed-rule-active yes)
    (overridden-fixed-aspect yes)
    (overridden-fixed-size yes)
    (tool "gimp-rect-select-tool")
    (highlight yes))
(use-fg-bg no)
(use-brush no)
(use-dynamics no)
(use-gradient no)
(use-pattern no)
(use-palette no)
(use-font no)

# end of GIMP tool preset file

```

Put this in a file in the tools-preset folder of your gimp settings (.gimp), when active you don't need to select an area, bud can just drag the rectangular to the correct place. Usually when working with gimp I don't use the cut frames but start with the slides cut from the scan. Using the select tool with the preset I then select each image process it (rotating, color level, etc) before storing it.

## Folder/file naming

When scanning negatives I started out by putting them into folders per roll of film, and naming the files 01,02,03, etc ending up with a structure like

```code
.
├── roll01
│   ├── 01.tiff
│   └── 02.tiff
├── roll02
│   ├── 01.tiff
│   └── 02.tiff
└── roll03
    ├── 01.tiff
    └── 02.tiff
```

When I came to roll 50 it started to become rather unmanageable. That's when I decided to rename my roll folders including a date and a small description.

'yyyy-mm-dd-{type}-{description}'

The reason to use year - month - day is that his will automatically sort my folders. The next issue I had was that in every roll folder the same image names were used.

Having the files include the folder name makes it easier to find files. Renaming by hand takes lot of effort and is error prone.

```code
#!/bin/bash
current=${PWD##*/}

files=(*.*)
i=0
for f in "${files[@]}"; do
    i=$(( i + 1 ))
    filename=$(basename -- "$f")
    ext="${filename##*.}"
    if [ $i -lt 10 ]
    then
      cnt=0${i}
    else
      cnt=${i}
    fi
    mv "$f" "${current}_${cnt}.${ext}"
done
```

This script will rename all files using the folder name and a sequence number.

## Backup

//TODO: Backup your files.
