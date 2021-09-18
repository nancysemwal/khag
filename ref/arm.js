import { send, common } from "node-mavlink";
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

export default arm;