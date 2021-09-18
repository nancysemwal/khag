var khag = require('../src/khag.cjs');

async function printArmable() {
    var path = '/dev/tty.usbmodem14201';
    var baudRate = 57600;
    var vehicle = khag.connect(path, baudRate);
    var armable = await khag.is_armable(vehicle);
    console.log('armable: ', armable);
    vehicle.port.removeListener('data', printArmable);
    vehicle.port.destroy();
    //return params;
}

printArmable();

