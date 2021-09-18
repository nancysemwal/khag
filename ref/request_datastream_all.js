import { common, MavLinkProtocolV2, send } from 'node-mavlink'

const request_datastream_all = (vehicle) => {
    let port    = vehicle.port;
    const message           = new common.RequestDataStream();
    message.targetSystem    = 1;
    message.targetComponent = 0;
    message.reqStreamId     = common.MavDataStream.ALL;
    message.reqMessageRate  = 1;
    message.startStop       = 1;
    port.on('open', async () => {
        send(port, message, new MavLinkProtocolV2());
    });
}

export default request_datastream_all;