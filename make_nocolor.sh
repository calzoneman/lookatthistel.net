#!/bin/bash

manifest="$1_nocolor.manifest"
echo -n > $manifest
i=0
for f in frames/*.jpg; do
    num=$(printf "%06d" $i)
    echo $num

    printf "\033[0;0H" >> "$manifest"
    jp2a $f --size=$1 >> "$manifest"
    echo -ne "\0" >> "$manifest"
    i=$((i+1))
done