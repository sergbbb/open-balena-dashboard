#!/bin/bash

FILE=./api/devices

if [ ! -f $FILE ]; then
   ssh-keygen -t rsa -b 2048 -C "example@gmail.com" -N "" -f $FILE
 else
    echo "SSH Key $FILE exist. Do nothing!"
fi
