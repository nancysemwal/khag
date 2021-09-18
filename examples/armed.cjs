var khag = require('../src/khag.cjs');

async function printArmed() {
    var path = '/dev/tty.usbmodem14201';
    var baudRate = 57600;
    var vehicle = khag.connect(path, baudRate);
    var armed = await khag.is_armed(vehicle);
    console.log(armed);
    //return params;
}

printArmed();

