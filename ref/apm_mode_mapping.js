import { ardupilotmega } from "node-mavlink";
const apm_mode_mapping = (mode) => {
    const all_modes = ardupilotmega.CopterMode;
    return all_modes[mode];
}

export default apm_mode_mapping;