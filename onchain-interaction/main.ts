//importing the idl
import proton_program from './proton.json'
const {v4 : uuidv4} = require('uuid')
import * as anchor from "@coral-xyz/anchor"
import { Idl, Program, Provider, Wallet} from "@coral-xyz/anchor"

import {

    Keypair,
  
    Transaction,
  
    PublicKey,
  
    sendAndConfirmTransaction,
  
    Connection,
    
    clusterApiUrl,
  
  } from "@solana/web3.js"

import {

    ValidDepthSizePair,
  
    createAllocTreeIx,
  
    SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  
    SPL_NOOP_PROGRAM_ID,
  
    ConcurrentMerkleTreeAccount,
  
} from "@solana/spl-account-compression"
import { airdropSolIfNeeded, getOrCreateKeypair } from './utils'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'


let connection: anchor.web3.Connection;
let wallet: anchor.web3.Keypair;
let merkleTreePub: anchor.web3.PublicKey;

async function main(){
  connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  wallet = await getOrCreateKeypair("USER_WALLET");
  await airdropSolIfNeeded(wallet.publicKey);
  
  merkleTreePub = new PublicKey("DZiLG55kgSW9zTLUY8d3Q3XnwkBRP1bfCefaFu6rTFum");

  merkleTreePub = new PublicKey("ErVDk4VkgEzp9Yx1UxD9Wv6izD8DjBnboqrZ7BNt1yon");
}

export async function pushConfig(commitMessage: string): Promise<string> {
  await main();
  const anchorWallet = new NodeWallet(wallet);
  const provider =  new anchor.AnchorProvider(connection, anchorWallet, {
    commitment: 'processed',
  });
  anchor.setProvider(provider);


  // const programId = new PublicKey("D51avfJqMZGGgCrqbNhYVBSiBHvJ7sv22HfnN8bWMyqR");
  const programId = new PublicKey("3nknjr6zxTcHyBtoPWZFH1ZeQ5SCeSSqTGS3eY6xtu3w");
  const program = new Program(proton_program as Idl, programId);


  const [treeAuthority] = PublicKey.findProgramAddressSync(

    [merkleTreePub.toBuffer()],

    programId

  )

  const txSignature = await program.methods

  .appendRelayer(commitMessage)

  .accounts({
    owner: anchorWallet.publicKey,

    merkleTree: merkleTreePub,

    treeAuthority: treeAuthority,

    logWrapper: SPL_NOOP_PROGRAM_ID,

    compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,

  }).signers([anchorWallet.payer])

  .rpc();

  return `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;

}


export async function getConfigs(){
  const url = "https://devnet.helius-rpc.com/?api-key=ab4a6d80-e0ae-4d91-be41-f427f8ea332b"
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'my-id',
      method: 'getAssetsByAuthority',
      params: {
        authorityAddress: 'DZiLG55kgSW9zTLUY8d3Q3XnwkBRP1bfCefaFu6rTFum',
        page: 1, // Starts at 1
        limit: 1000
      },
    }),
  });
  const { result } = await response.json();
  console.log("Assets by Authority: ", result.items);
}

async function test1() {
  try {
      let relayerID = uuidv4();
      const relayerConfig = {
        "relayerPubKey": "",
        "relayerControllerAddress": "api.zrok.io",
        "relayerUUID": `${relayerID}`,
        "operation": "create"
      }
      const relayerConfigString = JSON.stringify(relayerConfig);
      const data = await pushConfig(relayerConfigString);
      console.log(data);
  } catch (error) {
      console.error('Error: ', error);
  }
}
async function test2(){
  const response = await fetch('https://api-devnet.helius.xyz/v0/addresses/DZiLG55kgSW9zTLUY8d3Q3XnwkBRP1bfCefaFu6rTFum/transactions?api-key=ab4a6d80-e0ae-4d91-be41-f427f8ea332b', {
    method: 'GET',
    headers: {},
});
const data = await response.json();
console.log(data[0]["instructions"][0]);
}
test2();

