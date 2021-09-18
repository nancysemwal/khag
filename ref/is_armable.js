import { common, minimal, ardupilotmega} from 'node-mavlink'
import request_datastream_all from './request_datastream_all.js'


const get_mode = async(packet) => {
    return new Promise ((resolve) => {
        let flightmode = '';
        const category = packet.header.msgid;
            if(category == minimal.Heartbeat.MSG_ID){
                //console.log('mode');
                let fields = packet.protocol.data(packet.payload, minimal.Heartbeat);
                //armed = (fields.baseMode & minimal.MavModeFlag.SAFETY_ARMED) != 0;
                flightmode = ardupilotmega.CopterMode[fields.customMode];
                //console.log("armed: " + armed + " flightmode: ", flightmode);
                resolve(flightmode);
        };
    });
}

const get_gps = async(packet) => {
    return new Promise((resolve) => {
        let gps = -1;
        const category = packet.header.msgid;
        if(category == common.GpsRawInt.MSG_ID) { 
            //console.log('gps');
            gps = packet.protocol.data(packet.payload, common.GpsRawInt);
            resolve(gps);
        }
    });
}

const get_ekf = async(packet) => {
    return new Promise((resolve) => {
        let ekf_predposhorizabs = -1;
        const category = packet.header.msgid;
        if(category == ardupilotmega.EkfStatusReport.MSG_ID) {
            //console.log('ekf');
            let ekf = packet.protocol.data(packet.payload, ardupilotmega.EkfStatusReport);
            ekf_predposhorizabs = (ekf.flags & ardupilotmega.EkfStatusFlags.PRED_POS_HORIZ_ABS) > 0;
            resolve(ekf_predposhorizabs);
        }
    });
}

 const is_armable = async (vehicle) => {
    return new Promise((resolve) => {
        console.log("Waiting for essential parameters");
        let reader              = vehicle.reader;
        //let armable             = false;
        const whenData = async (packet) => {
            //console.log('in when data');
            const promises = [];
            promises.push(get_mode(packet));
            promises.push(get_gps(packet));
            promises.push(get_ekf(packet));
            //await Promise.all(promises).then((values) => {console.log(values)});
            let values = await Promise.all(promises);
            console.log('all resolved');
            console.log(values);
            //let gps        = await get_gps(packet);


            //let flightmode = await get_mode(packet);

            //if(gps.fixType != null && gps.fixType > 1){
            //    resolve(true);
            //}
            //let ekf_predposhorizabs = await get_ekf(packet);
            //console.log(gps);
            //console.log(flightmode);
            //console.log(ekf_predposhorizabs); 
            //armable = (flightmode!='INITIALISING' && gps && ekf_predposhorizabs);
            //resolve(flightmode);
        };
        request_datastream_all(vehicle);
        reader.on('data', whenData);
        //resolve(armable);
    });
} 

/*const is_armable = async (vehicle) => {
    console.log("Waiting for essential parameters");
    return new Promise((resolve) => {
        let reader              = vehicle.reader;
        //let armable             = false;
        let flightmode = '';
        let gps = -1;
        let ekf_predposhorizabs = -1;
        const whenData = async (packet) => {
            if(packet.header.msgid == minimal.Heartbeat.MSG_ID) {
                flightmode = await get_mode(packet);
                //console.log(flightmode)
            }
            if(packet.header.MSG_ID == common.GpsRawInt.MSG_ID) {
                gps = await get_gps(packet);
                console.log(gps);
            }
            if(packet.header.MSG_ID == ardupilotmega.EkfStatusReport.MSG_ID) {
                ekf_predposhorizabs = await get_ekf(packet);
                console.log(ekf_predposhorizabs);
            }
            //armable = (flightmode!='INITIALISING' && gps && ekf_predposhorizabs);
            resolve(true);
        };
        request_datastream_all(vehicle);
        reader.on('data', whenData);
        //resolve(armable);
    });
}*/

export default is_armable;