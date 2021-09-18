
async function printAttitude() {
    var khag = require("../src/khag.cjs");
    var path = '/dev/tty.usbmodem14201';
    var baudRate = 57600;
    var vehicle = khag.connect(path, baudRate);
    var attitude = await khag.get_attitude(vehicle);
    console.log(attitude);
    var port = vehicle.port;
    port.removeAllListeners()
    port.destroy()
}
printAttitude();