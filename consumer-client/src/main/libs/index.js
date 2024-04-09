import { ensureDir, readFile, readdir, remove, stat, writeFile } from 'fs-extra'
import { get } from 'http'
import { isEmpty } from 'lodash'
import { homedir } from 'os'
import path from 'path'
const readlineSync = require('readline-sync');
const fs = require('fs')


export const getRootDir = () => {
    console.log(homedir());
    return `${homedir()}\\atomnetwork-proton`
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

    fs.mkdir(folderPath, (err)=>{
        if(err){
            console.error('Error creating folder', err);
            return false;
        }

        fs.writeFile(userProfilePath, JSON.stringify(userProfile), (err)=>{
            if(err){
                console.error('Error creating the user profile', err);
                return false;  
            }
        })
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