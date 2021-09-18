const SerialPort = require('serialport');
const Nm = require("node-mavlink");
const MavLinkPacketSplitter = Nm.MavLinkPacketSplitter;
const MavLinkPacketParser = Nm.MavLinkPacketParser;

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

module.exports = connect;
