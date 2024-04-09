import {pushConfig, fetchConfig} from './commonInteractions'
const {v4 : uuidv4} = require('uuid')

async function test1() {
    try {
        const now = new Date();
        const epochTimestamp = Math.floor(now.getTime() / 1000);
        let relayerID = uuidv4();
        const relayerConfig = {
          "relayerPubKey": "",
          "relayerControllerAddress": "api.zrok.io",
          "relayerUUID": `${relayerID}`,
          "timestamp": `${epochTimestamp}`
        }
        const relayerConfigString = JSON.stringify(relayerConfig);
        const data = await pushConfig(relayerConfigString,"relayer");
        console.log(data);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function test2() {
    try {
        const data = await fetchConfig("proton");
        console.log(data);
    } catch (error) {
        console.error('Error: ', error);
    }
}

async function test3() {
    try {
        const now = new Date();
        const epochTimestamp = Math.floor(now.getTime() / 1000);
        let protonID = uuidv4();
        const protonConfig = {
          "protonPubKeyAddress": "fkor39ij93h",
          "protonRouterAddress": "efk93ur3.zrok.io",
          "protonControllerAddress": "api.zrok.io",
          "protonUUID": `${protonID}`,
          "timestamp": `${epochTimestamp}`,
          "resources": {
            "cpu": "8",
            "ram": "512"
          },
          "commit": {
          }
        }
        const protonConfigString = JSON.stringify(protonConfig);
        const data = await pushConfig(protonConfigString,"proton");
        console.log(data);
    } catch (error) {
        console.error('Error: ', error);
    }
}

test1();