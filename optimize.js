#!/usr/bin/node
const fs = require('fs');

const buffer = fs.readFileSync(process.argv[2]);
const newBuffer = Buffer.alloc(buffer.length);
var currentEscape = null;
var j = 0;
for (var i = 0; i < buffer.length;) {
    if (buffer[i] === 0x1b && buffer[i+1] === 0x5b
            && buffer[i+2] === 0x33
            && buffer[i+4] === 0x6d) {
        const escapeCode = buffer.toString('binary', i, i+5);
        if (escapeCode !== currentEscape) {
            newBuffer.write(escapeCode, j, escapeCode.length, 'binary');
            j += 5;
            currentEscape = escapeCode;
        }
        i += 5;
    } else if (buffer[i] === 0x1b && buffer[i+1] === 0x5b
            && buffer[i+2] === 0x30
            && buffer[i+3] === 0x6d) {
        i += 4;
    } else {
        newBuffer[j++] = buffer[i++];
    }
}

newBuffer.write('\x1b[0m', j, 4, 'binary');
j += 4;
fs.writeFileSync(process.argv[2], newBuffer.slice(0, j));
