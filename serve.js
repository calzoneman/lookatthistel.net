const net = require('net');
const fs = require('fs');

const FRAME_MS = 1000/23.98;

function parse(filename) {
    const buffer = fs.readFileSync(filename);
    const frames = [];
    var index = 0;
    var nextIndex;
    while ((nextIndex = buffer.indexOf(0x00, index)) >= 0) {
        frames.push(buffer.toString('utf8', index, nextIndex));
        index = nextIndex + 1;
    }

    console.log(`${filename}: read ${frames.length} frames`);
    return frames;
}

const MANIFESTS = {
    8024: parse('80x24.manifest'),
    12036: parse('120x36.manifest'),
    12037: parse('120x36_nocolor.manifest')
};

function nextFrame(frames, frameNum, socket) {
    if (frameNum >= frames.length) {
        try {
            socket.end();
        } catch (e) {
        }
        return;
    }

    const start = process.hrtime();
    try {
        if (!socket.write(frames[frameNum])) {
            socket.once('drain', () => {
                const timediff = process.hrtime(start);
                const timediffMs = Math.floor(timediff[1] / 1e6);
                if (timediffMs < FRAME_MS) {
                    // Socket drained before next frame, wait for next frame
                    setTimeout(() => {
                        nextFrame(frames, frameNum+1, socket);
                    }, FRAME_MS - timediffMs);
                } else {
                    // Took longer than 1 frame to drain socket, so continue full speed ahead
                    nextFrame(frames, frameNum+1, socket);
                }
            });
        } else {
            // Socket didn't get backlogged at all, wait for next frame
            setTimeout(() => {
                nextFrame(frames, frameNum+1, socket);
            }, FRAME_MS);
        }
    } catch (e) {
        try {
            socket.destroy();
        } catch (e) {
        }
        return;
    }
}

Object.keys(MANIFESTS).forEach(port => {
    net.createServer((socket) => {
        console.log(`${port}: new client ${socket.remoteAddress}`);
        socket.on('data', () => {
            try {
                socket.end();
            } catch (e) {
            }
        });
        socket.on('error', () => {
        });
        nextFrame(MANIFESTS[port], 0, socket);
    }).listen(port);
});
