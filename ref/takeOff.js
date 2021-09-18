import { send, common } from "node-mavlink";

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
};

export default takeOff;