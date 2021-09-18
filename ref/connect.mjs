import SerialPort from 'serialport'
import { MavLinkPacketSplitter, MavLinkPacketParser } from 'node-mavlink'

const connect = (path, baudRate) => {

    if(path == null) {
        console.error('Missing Path');
        return;
    }

    if(baudRate == null) {
        console.error('Missing baudRate');
        return;
    }

    try {
        const port  = new SerialPort(path, {
            baudRate: baudRate
        });


        const reader = port
        .pipe(new MavLinkPacketSplitter())
        .pipe(new MavLinkPacketParser());

        return {port, reader};
    }
    catch (err) {
        console.log("Error in port decl.");
    }
    return undefined;

    /*
    return new Promise((resolve, reject) => {
        port.on('error', function(err) {
            reject(["Err", err]);
        })
        port.open(function(err){
            if(err) {
                reject(["Err in opening", err]);
            }
            resolve(port);
        });
     });
     */


    
};

export default connect; 

