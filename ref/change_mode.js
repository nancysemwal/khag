import { common, send, minimal, MavLinkProtocolV2 } from 'node-mavlink'
import apm_mode_mapping from './apm_mode_mapping.js';

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

export default change_mode;