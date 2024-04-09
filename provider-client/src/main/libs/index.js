import { Axios } from 'axios'
import { exec } from 'child_process'
import { ensureDir, readFile, readdir, remove, stat, writeFile } from 'fs-extra'
import { get } from 'http'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
import { Regex } from 'react-bootstrap-icons'
import axios from 'axios';
const yaml = require('js-yaml');

let Docker = require('dockerode');
let docker = new Docker();

const readlineSync = require('readline-sync');
const fs = require('fs')
const {v4:uuidv4} = require('uuid')
export const getRootDir = () => {
    return `${homedir()}\\atomnetwork-provider`
}

export const confirmFolder = async () =>{
    const rootDir = getRootDir();
    try {
        const isFolderExists = await fs.existsSync(rootDir);
        console.log(isFolderExists);
        return isFolderExists;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const confirmUserProfile = async() =>{
    let rootDir = getRootDir();
    rootDir = rootDir+'\\userprofile.json';
    try {
        fs.accessSync(rootDir,fs.constants.F_OK);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const completeSetup = async(userProfile) =>{
    let rootDir = getRootDir();
    const folderPath = rootDir;
    const userProfilePath = path.join(folderPath, 'userprofile.json');

    const child = exec('zrok reserve public --backend-mode proxy http://localhost:3009/').on('error',function(err){throw err})
    child.stdout.on('data',(data)=>{
        let res = JSON.parse(data)
        console.log(res['msg']);
    });

    child.stderr.on('data', async(data)=>{
        let regex = new RegExp('https:\/\/(.*)\.share\.zrok\.io');
        let result = data.match(regex);
        if(result){
            let temp = JSON.parse(JSON.stringify(userProfile));
            temp["zrok_url"] = result[0];
            temp["zrok_token"] = result[1];
            const now = new Date();
            const epochTimeStamp = Math.floor(now.getTime()/1000);
            const providerID = uuidv4();
            const providerConfig = {
                "protonPubKeyAddress": temp["walletPub"],
                "protonRouterAddress": temp["zrok_url"],
                "protonControllerAddress": "api.zrok.io",
                "protonUUID": `${providerID}`,
                "timestamp": `${epochTimeStamp}`,
                "resources":{
                    "cpu": "8",
                    "ram": "512"
                },
                "commit": {}
            }
            temp["protonConfig"] = providerConfig;
            userProfile = temp;
            fs.mkdir(folderPath, (err)=>{
                if(err){
                    console.error('Error creating folder', err);
                }
        
                fs.writeFile(userProfilePath, JSON.stringify(userProfile), (err)=>{
                    if(err){
                        console.error('Error creating the user profile', err);
                    }
                    else{
                        let rootDir = getRootDir();
                        const folderPath = rootDir;
                        const userProfilePath = path.join(folderPath, 'userprofile.json');
                        const data = fs.readFileSync(userProfilePath,'utf-8');
                        console.log(data);
                        // axios.get(`http://localhost:3008`, config).then(res =>{
                        //     console.log(res);
                        //     return (data);
                        // });
                        axios({
                            method: 'post',
                            url: 'http://localhost:3008',
                            data: JSON.parse(data)
                        });
                    }
                })
            });
        }
    })

}

export const fetchUserData = async() =>{
    let rootDir = getRootDir();
    rootDir = rootDir+'\\userprofile.json';

    try {

        const fileContent = fs.readFileSync(rootDir, 'utf-8');
        return fileContent;

    } catch (error) {
        console.log(error);
        return error;
    }
}

export const fetchDockerCompose = async(pathVar) =>{

    try {

        const fileContent = fs.readFileSync(pathVar, 'utf-8');
        return fileContent;

    } catch (error) {

        console.log(error);
        return error;
    }
}

export const getRunningContainers = async() =>{
    const containers = await docker.listContainers();
    for(let c of containers){
        let containerId = c.Id;
        try {

            let containerObj = docker.getContainer(containerId);
            let stats = await containerObj.stats({stream:false});
            c['stats'] = stats;
            c['RAM'] = formatBytes(stats.memory_stats.usage)+"/"+formatBytes(stats.memory_stats.limit);
            
        } catch (error) {
            console.log(error);
        }
    }
    return containers;
}

const formatBytes = (bytes, decimals=2) =>{
    if(!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals <0?0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    const i = Math.floor(Math.log(bytes)/Math.log(k));
    return `${parseFloat((bytes/Math.pow(k,i)).toFixed(dm))} ${sizes[i]}`
}

export const isDockerInstalled = async() =>{
    try {
        const containers = await docker.listContainers();
        return true;
        
    } catch (error) {
        return false;
    }
}

export const runDocker = (val) =>{
    let rootDir = getRootDir();
    const folderPath = rootDir;
    const yamlData = yaml.load(val);
    const appService = yamlData.services.app;
    const portMapping = appService.ports[0];

    // Split the port mapping to get the host and container ports
    const [hostPort, containerPort] = portMapping.split(':');

    const child = exec(`zrok reserve public --backend-mode proxy http://${hostPort}:${containerPort}/`).on('error',function(err){throw err})
    child.stdout.on('data',(data)=>{
        let res = JSON.parse(data)
        console.log(res['msg']);
    });
    let result;
    child.stderr.on('data', async(data)=>{
        let regex = new RegExp('https:\/\/(.*)\.share\.zrok\.io');
        result = data.match(regex);
        const child2 = exec(`zrok share reserved ${result[1]}`);
        const userprofilepath = path.join(folderPath,'userprofile.json')
        let temp = fs.readFileSync(userprofilepath,'utf-8');
        console.log("-----");
        console.log(temp);
        let tempJSON = JSON.parse(temp);
        tempJSON["createdCommits"].push(result[0]);
        axios({
            method: 'post',
            url: 'http://localhost:3008',
            data: tempJSON
        });
    })

    const dockerFilePath = path.join(folderPath, 'tmp_docker.yaml');
    fs.writeFile(dockerFilePath, val, (err) => {
        if(err){
            console.log("Error creating the docker file");
        }
    });

    let tmp_child = exec(`docker-compose -f ${dockerFilePath} up`)
    tmp_child.stdout.on('data',(data)=>{
        console.log(data);
    })

}

