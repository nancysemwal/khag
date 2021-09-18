var SerialPort = require('serialport');

var path = '/dev/tty.usbmodem14201';
var baudRate = 57600;
var port = new SerialPort(path, {baudRate: baudRate});

console.log('first ', port.listenerCount('data'));
port.on('open', () => {
    console.log('Now ', port.listenerCount('data'));
})
const f1 = () => {
    console.log('hey');
}
port.addListener('data', f1);
console.log('Lastly ',port.listenerCount('data'));
port.removeListener('data', f1);
console.log('Finally ',port.listenerCount('data'));
port.destroy();
