var khag = require('../src/khag.cjs');

async function printParams() {
    var path = '/dev/tty.usbmodem14201';
    var baudRate = 57600;
    var vehicle = khag.connect(path, baudRate);
    //var port = new SerialPort(path, {baudRate: baudRate});

    khag.sendParamMavMsg(vehicle);
    var params = await khag.get_params(vehicle);
    console.log(params);
    return params;
}

var x = printParams();

