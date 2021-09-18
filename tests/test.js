//const get_attitude = require('../src/get_attitude');
import get_attitude from '../src/get_attitude.js';
import connect from '../src/connect.js';

let path = '/dev/tty.usbmodem14201';
let baudRate = 57600;
try{
        let vehicle = connect(path, baudRate);
        const port = vehicle.port;
        if(vehicle === undefined){
            console.log('could not connect');
            process.exit();
    }
    let attitude = await get_attitude(vehicle);
    console.log('attitude:', attitude);
    port.destroy();
} 
catch (err) {
    console.log(err);
}

