import connect from '../src/connect.js';
import is_armable from '../src/is_armable.js';

let path = '/dev/tty.usbmodem14201';
let baudRate = 57600;
try{
        let vehicle = connect(path, baudRate);
        const port = vehicle.port;
        if(vehicle === undefined){
            console.log('could not connect');
            process.exit();
    }
    let isArmable = await is_armable(vehicle);
    //console.log('isArmable is: ', isArmable);
    //port.removeAllListeners();
    //port.destroy();
} 
catch (err) {
    console.log(err);
}

