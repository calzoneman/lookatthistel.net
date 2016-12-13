#!/bin/bash

manifest="$1.manifest"
echo -n > $manifest
i=0
for f in frames/*.jpg; do
    num=$(printf "%06d" $i)
    echo $num

    printf "\033[0;0H" >> "$manifest"
    jp2a --colors $f --size=$1 >> "$manifest"
    echo -ne "\0" >> "$manifest"
    i=$((i+1))
done

node optimize.js "$manifest"
