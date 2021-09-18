import SerialPort from 'serialport';
import { MavLinkPacketSplitter, MavLinkPacketParser, sleep} from 'node-mavlink'

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
};

export default connect;
