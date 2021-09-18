const SerialPort = require('serialport');
const Nm = require("node-mavlink");
const MavLinkPacketSplitter = Nm.MavLinkPacketSplitter;
const MavLinkPacketParser = Nm.MavLinkPacketParser;
const MavLinkProtocolV2 = Nm.MavLinkProtocolV2;
const send = Nm.send;
const common = Nm.common;
const minimal = Nm.minimal;
const ardupilotmega = Nm.ardupilotmega;

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

function sendAttMavMsg(vehicle) {
    let port = vehicle.port;
    let message = new common.CommandLong();
    message.targetSystem = 1;
    message.targetComponent = 1;
    message.command = 512; 
    message.param1 = 30;
    return send(port, message, new MavLinkProtocolV2());
}

const get_attitude = async (vehicle) => {
    return new Promise((resolve) => {
        const whenData = async (packet) => {
            const category = packet.header.msgid;
            if(category === common.Attitude.MSG_ID) {
                const attitude = packet.protocol.data(packet.payload, common.Attitude);
                vehicle.port.removeListener('data', whenData);
                vehicle.port.destroy();
                resolve(attitude);
            }
        };
        let reader = vehicle.reader;
        reader.on('data', whenData);
    });
};

const request_datastream_all = (vehicle) => {
    let port                = vehicle.port;
    const message           = new common.RequestDataStream();
    message.targetSystem    = 1;
    message.targetComponent = 0;
    message.reqStreamId     = common.MavDataStream.ALL;
    message.reqMessageRate  = 1;
    message.startStop       = 1;
    return send(port, message, new MavLinkProtocolV2());

}

const is_armable = async (vehicle) => {
    return new Promise((resolve) => {
        //let armable             = false;
        let flightmode          = '';
        let gps                 = -1;
        let ekf_predposhorizabs = -1;
        const whenData = (packet) => {
            if(flightmode !== '' && gps !== -1 && ekf_predposhorizabs !== -1) {
                /*
                if (flightmode === armableFlightMode && 
                    gps === armableGps && 
                    ekf_predposhorizabs === armableEkf) {
                    resolve(true);
                }
                resolve(false);
                */
               armable = (flightmode != 'INITIALISING' && (gps.fixType != null && gps.fixType > 1) && ekf_predposhorizabs);
                //resolve([flightmode, gps, ekf_predposhorizabs]);
                resolve(armable);
            }
            let category = packet.header.msgid;
            if(category == minimal.Heartbeat.MSG_ID) {
                let fields = packet.protocol.data(packet.payload, minimal.Heartbeat);
                flightmode = ardupilotmega.CopterMode[fields.customMode];
            }
    
            if(category == common.GpsRawInt.MSG_ID) { 
                //console.log('gps');
                gps = packet.protocol.data(packet.payload, common.GpsRawInt);
            }
    
            if(category == ardupilotmega.EkfStatusReport.MSG_ID) {
                //console.log('ekf');
                let ekf = packet.protocol.data(packet.payload, ardupilotmega.EkfStatusReport);
                ekf_predposhorizabs = (ekf.flags & ardupilotmega.EkfStatusFlags.PRED_POS_HORIZ_ABS) > 0;
            }                
        };
        //console.log('waiting for essential parameters');
        let reader = vehicle.reader;
        reader.on('data', whenData);
        request_datastream_all(vehicle);
    });
}

const is_armed = async(vehicle) => {
    return new Promise ((resolve) => {
        let armed = false;
        const whendata = async(packet) =>{
            if(packet.header.msgid == minimal.Heartbeat.MSG_ID){
                let fields = packet.protocol.data(packet.payload, minimal.Heartbeat);
                armed = (fields.baseMode & minimal.MavModeFlag.SAFETY_ARMED) != 0;
                vehicle.port.removeListener('data', whendata);
                vehicle.port.destroy();
                resolve(armed);
            }
        };
        
        let reader = vehicle.reader;
        reader.on('data', whendata);
    });
}

const apm_mode_mapping = (mode) => {
    const all_modes = ardupilotmega.CopterMode;
    return all_modes[mode];
}

const change_mode = (vehicle, mode) => {
    const flightmode = apm_mode_mapping(mode);
    if(flightmode === undefined) {
        console.error('Unknown mode:', mode);
        return;
    }
    const port = vehicle.port;
    const modeChangeMsg = new common.SetMode();
    modeChangeMsg.targetSystem = 1;
    modeChangeMsg.baseMode = minimal.MavModeFlag.CUSTOM_MODE_ENABLED;
    modeChangeMsg.customMode = flightmode; 

    send(port, modeChangeMsg, new MavLinkProtocolV2());
}

const arm = (vehicle) => {
    const port = vehicle.port;
    const armMsg = new common.CommandLong();
    armMsg.targetSystem = 1;
    armMsg.targetComponent = 0;
    armMsg.confirmation = 0;
    armMsg.command = common.MavCmd.COMPONENT_ARM_DISARM; //400
    armMsg.param1 = 1; //1 is for arming
    armMsg.param2 = 0;
    armMsg.param3 = 0;
    armMsg.param4 = 0;
    armMsg.param5 = 0;
    armMsg.param6 = 0;
    armMsg.param7 = 0;
    send(port, armMsg, new MavLinkProtocolV2());
};

const takeOff = (vehicle, altitude) => {
    const port = vehicle.port;
    const takeoffMsg = new common.CommandLong();
    takeoffMsg.targetSystem = 1;
    takeoffMsg.targetComponent = 0;
    takeoffMsg.command = common.MavCmd.NAV_TAKEOFF; //22
    takeoffMsg.confirmation = 0;
    takeoffMsg.param1 = 0;
    takeoffMsg.param2 = 0;
    takeoffMsg.param3 = 0;
    takeoffMsg.param4 = 0;
    takeoffMsg.param5 = 0;
    takeoffMsg.param6 = 0;
    takeoffMsg.param7 = altitude;

    if(target_altitude != null) {
        //TODO: check for float as done in dronekit
        if(isFinite(target_altitude)) {
            send(port, takeoffMsg, new MavLinkProtocolV2());
        }
    }
}

const land = (vehicle, lat, long) => {
    const port = vehicle.port;
    const landMsg = new common.CommandLong();
    landMsg.targetSystem = 1;
    landMsg.targetComponent = 0;
    landMsg.confirmation = 0;
    landMsg.command = common.MavCmd.NAV_LAND;
    landMsg.param1 = 0; // abort alt
    landMsg.param2 = 0; // land mode
    landMsg.param3 = 0; // empty
    landMsg.param4 = 0; // yaw angle
    landMsg.param5 = lat; // lat. If 0, lands at current lat.
    landMsg.param6 = long; // long 
    landMsg.param7 = 0; // alt
    send(port, landMsg, new MavLinkProtocolV2());
}

const RTL = (vehicle) => {
    const port = vehicle.port;
    const RTLMsg = new common.CommandLong();
    RTLMsg.targetSystem = 1;
    RTLMsg.targetComponent = 0;
    RTLMsg.confirmation = 0;
    RTLMsg.command = common.MavCmd.NAV_RETURN_TO_LAUNCH;
    send(port, RTLMsg, new MavLinkProtocolV2());
}

const goTo = (vehicle, lat, long, alt) => {
    const port = vehicle.port;
    const gotoMsg = new common.MissionItem();
    gotoMsg.targetSystem = 1;
    gotoMsg.targetComponent = 0;
    gotoMsg.seq = 0; //API will itself insert correct sequence number. Autopilot rejects messages sent out of sequence.
    gotoMsg.frame = common.MavFrame.GLOBAL_RELATIVE_ALT;
    gotoMsg.command = common.MavCmd.NAV_WAYPOINT;
    gotoMsg.current = 0; 
    gotoMsg.autocontinue = 0;
    gotoMsg.param1 = 0;     //hold
    gotoMsg.param2 = 0;     //accept radius
    gotoMsg.param3 = 0;     //pass radius
    gotoMsg.param4 = 0;     //yaw
    gotoMsg.x = lat;        // lat
    gotoMsg.y = long;       // long
    gotoMsg.z = alt;         // altitude
    gotoMsg.missionType = common.MavMissionType.MISSION;
    send(port, gotoMsg, new MavLinkProtocolV2());
}

const sendParamMavMsg = (vehicle) => {
    let port = vehicle.port;
    const message = new common.ParamRequestList();
    message.targetSystem = 1;
    message.targetComponent = 1;
    return send(port, message, new MavLinkProtocolV2())
}

const get_params = async (vehicle) => {
    return new Promise((resolve) => {
        const all_params = [];
        let c = 1;
        const whendata = async (packet) => {
            if(packet.header.msgid == common.ParamValue.MSG_ID) {
                let fields = packet.protocol.data(packet.payload, common.ParamValue);
                all_params.push(fields);
                c++;
                //console.log(c);
                //console.log(c++);
            }
            if(c === 5) {
                vehicle.port.removeListener('data', whendata);
                vehicle.port.destroy();
                resolve(all_params);
            }

        };
        let reader = vehicle.reader;
        reader.on('data', whendata);
    })
}
module.exports = {
    connect: connect,
    get_attitude: get_attitude,
    is_armed: is_armed,
    is_armable: is_armable,
    change_mode: change_mode,
    arm: arm,
    takeOff: takeOff,
    land: land,
    RTL: RTL,
    goTo: goTo,
    sendAttMavMsg: sendAttMavMsg,
    get_params: get_params,
    sendParamMavMsg: sendParamMavMsg,
    request_datastream_all: request_datastream_all 
};


/* const get_mode = async(packet) => {
    return new Promise ((resolve) => {
        let flightmode = '';
        const category = packet.header.msgid;
            if(category == minimal.Heartbeat.MSG_ID){
            let fields = packet.protocol.data(packet.payload, minimal.Heartbeat);
            flightmode = ardupilotmega.CopterMode[fields.customMode];
            //console.log(" flightmode: ", flightmode);
            resolve(flightmode);
        };
    });
}

const get_gps = async(packet) => {
    return new Promise((resolve) => {
        let gps = -1;
        const category = packet.header.msgid;
        if(category == common.GpsRawInt.MSG_ID) {
            //console.log('in gps');
            gps = packet.protocol.data(packet.payload, common.GpsRawInt);
            //console.log(gps);
            resolve(gps);
        }
    });
}

const get_ekf = async(packet) => {
    return new Promise((resolve) => {
        let ekf_predposhorizabs = -1;
        const category = packet.header.msgid;
        if(category == ardupilotmega.EkfStatusReport.MSG_ID) {
            console.log('in ekf');
            let ekf = packet.protocol.data(packet.payload, ardupilotmega.EkfStatusReport);
            ekf_predposhorizabs = (ekf.flags & ardupilotmega.EkfStatusFlags.PRED_POS_HORIZ_ABS) > 0;
            resolve(ekf_predposhorizabs);
        }
    });
} */