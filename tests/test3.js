import connect from "./connect.mjs";
import change_mode from "./change_mode.js";
//import arm from "arm.js";
//import takeOff from 'takeOff.js';
//import is_armable from "./is_armable.js";
//import { sleep } from "node-mavlink";

let path = '/dev/tty.usbmodem14201';
let baudRate = 57600;
try{
        let vehicle = connect(path, baudRate);
        const port = vehicle.port;
        if(vehicle === undefined){
            console.log('could not connect');
            process.exit();
    }
    /*while(!is_armable(vehicle)){
        console.log('waiting to initialize');
        await sleep(1000);
    }*/
    //TODO - this should be done after performing checks.
    change_mode(vehicle, '3');
    //arm(vehicle);
    //takeOff(vehicle, altitude);
} 
catch (err) {
    console.log(err);
}