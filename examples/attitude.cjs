var khag = require("../src/khag.cjs");
async function printAttitude() {
    
    var path = '/dev/tty.usbmodem14201';
    var baudRate = 57600;
    var vehicle = khag.connect(path, baudRate);
    //await khag.sendAttMavMsg;
    await khag.request_datastream_all(vehicle);
    var attitude = await khag.get_attitude(vehicle);
    console.log(attitude);
    return attitude;
}
printAttitude();


/* var khag = require("../src/khag.cjs");
var path = '/dev/tty.usbmodem14201';
var baudRate = 57600;
var vehicle = khag.connect(path, baudRate);*/