import { common, MavLinkProtocolV2, send } from 'node-mavlink'


function sendAttMavMsg(vehicle) {
    let port = vehicle.port;
    let message = new common.CommandLong();
    message.targetSystem = 1;
    message.targetComponent = 1;
    message.command = 512; 
    message.param1 = 30;
    port.on('open', async () => {
        await send(port, message, new MavLinkProtocolV2());
    });
    console.log("message sent");

}

const fetch_attitude = async (packet) => {
    //console.log('in fetch attitude');
    return new Promise((resolve) => {
        const category = packet.header.msgid;
        if(category == common.Attitude.MSG_ID) {
            console.log('inside IF');
            const fields = packet.protocol.data(packet.payload, common.Attitude);
            console.log(fields);
            resolve(fields);
        }
    });
}

const get_attitude = (vehicle) => {
    return new promise((resolve) => {
        const whendata = async (packet) => {
            const category = packet.header.msgid;
            if(category == common.attitude.msg_id) {
                const attitude = packet.protocol.data(packet.payload, common.attitude);
                resolve(attitude);
            }
        };
        sendattmavmsg(vehicle);
        let reader = vehicle.reader;
        reader.on('data', whendata);
    });
};

export default get_attitude;