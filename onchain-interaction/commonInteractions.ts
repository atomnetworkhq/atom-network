//importing the idls of both the trees

import proton_program from './proton.json'
import relayer_program from './relayer.json'

//import public tree and programs data
import onchainData from './tree-data.json';
import * as anchor from "@coral-xyz/anchor"
import { Idl, Program, Provider, Wallet} from "@coral-xyz/anchor"
import {Keypair,Transaction,PublicKey,sendAndConfirmTransaction,Connection,clusterApiUrl,} from "@solana/web3.js"
import {ValidDepthSizePair,createAllocTreeIx,SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,SPL_NOOP_PROGRAM_ID,ConcurrentMerkleTreeAccount} from "@solana/spl-account-compression"
import { airdropSolIfNeeded, getOrCreateKeypair } from './utils'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'

import bs58 from 'bs58';
const fs = require('fs');
const path = require('path');


let connection: anchor.web3.Connection;
let wallet: anchor.web3.Keypair;
let merkleTreePub: anchor.web3.PublicKey;
let programId: anchor.web3.PublicKey;
async function main(){
    connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    wallet = await getOrCreateKeypair("USER_WALLET");
    console.log(wallet);
    await airdropSolIfNeeded(wallet.publicKey);
}

export async function pushConfig(config:string,type:string): Promise<string>{
    console.log("hello");
    await main();
    const anchorWallet = new NodeWallet(wallet);
    console.log("here");
    console.log(anchorWallet);
    const provider =  new anchor.AnchorProvider(connection, anchorWallet, {
        commitment: 'processed',
    });
    anchor.setProvider(provider);
    let MY_ENV_VAR = "CURRENT_CONFIG";
    if (!process.env.MY_ENV_VAR) {
        require('fs').appendFileSync('.env', `\n${MY_ENV_VAR}=${config}`);
    } 
    if(type.toLowerCase()==='relayer'){
        merkleTreePub = new PublicKey(onchainData.relayerTree.treeID);
        programId = new PublicKey(onchainData.relayerTree.programID);
        const program = new Program(relayer_program as Idl, programId);
        const merkleTreeAccount =
        await ConcurrentMerkleTreeAccount.fromAccountAddress(
          connection,
          merkleTreePub
        )
        const temp = await merkleTreeAccount.tree.activeIndex;
        MY_ENV_VAR = "LEAF_INDEX";
        if (!process.env.MY_ENV_VAR) {
            require('fs').appendFileSync('.env', `\n${MY_ENV_VAR}=${parseInt(temp)+1}`);
        } 
        const [treeAuthority] = PublicKey.findProgramAddressSync(
            [merkleTreePub.toBuffer()],
            programId
        )
    
        const txSignature = await program.methods
        .appendRelayer(config)
        .accounts({
          owner: anchorWallet.publicKey,
          merkleTree: merkleTreePub,
          treeAuthority: treeAuthority,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        }).signers([anchorWallet.payer])
        .rpc();

        let result = {
            "txSig": `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
            "leafIndex": parseInt(temp)+1
        };

        return JSON.stringify(result);
    }
    else{
        merkleTreePub = new PublicKey(onchainData.protonTree.treeID);
        programId = new PublicKey(onchainData.protonTree.programID);
        const program = new Program(proton_program as Idl, programId);
        const merkleTreeAccount =
        await ConcurrentMerkleTreeAccount.fromAccountAddress(
          connection,
          merkleTreePub
        )
        const temp = await merkleTreeAccount.tree.activeIndex;
        MY_ENV_VAR = "LEAF_INDEX";
        if (!process.env.MY_ENV_VAR) {
            require('fs').appendFileSync('.env', `\n${MY_ENV_VAR}=${parseInt(temp)+1}`);
        } 

        const [treeAuthority] = PublicKey.findProgramAddressSync(
            [merkleTreePub.toBuffer()],
            programId
        )
        const txSignature = await program.methods
        .appendProton(config)
        .accounts({
          owner: anchorWallet.publicKey,
          merkleTree: merkleTreePub,
          treeAuthority: treeAuthority,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        }).signers([anchorWallet.payer])
        .rpc();

        let result = {
            "txSig": `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`,
            "leafIndex": temp+1
        };

        return JSON.stringify(result);
    }
}

export async function fetchConfig(type:string): Promise<string>{
    await main();
    let id = "";
    if(type.toLowerCase()==="relayer"){
        id = onchainData.relayerTree.treeID;
    }
    else{
        id = onchainData.protonTree.treeID;
    }

    const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/${id}/transactions?api-key=`,{
        method: 'GET',
        headers: {},
    });

    let data = await response.json();
    const result = data.filter((item: { instructions: string | any[]; }) => item.instructions.length === 1)
      .map((item: { instructions: { data: any; }[]; }) => {
        const instructionData = item.instructions[0].data;
        const decodedData = Buffer.from(bs58.decode(instructionData)).toString('utf8');
        const start = decodedData.indexOf('{');
        const end = decodedData.lastIndexOf('}') + 1;
        const jsonData = JSON.parse(decodedData.slice(start, end));
        return { data: jsonData };
      });
    const simplifiedArray = result.map((item: { data: any; }) => item.data);
    return JSON.stringify(simplifiedArray);
}
