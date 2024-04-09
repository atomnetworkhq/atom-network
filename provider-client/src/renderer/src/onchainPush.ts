import proton_program from '../../main/libs/proton.json'
import onchainData from '../../main/libs/tree-data.json';
import * as anchor from "@coral-xyz/anchor"
import { Idl, Program, Provider, Wallet} from "@coral-xyz/anchor"
import {Keypair,Transaction,PublicKey,sendAndConfirmTransaction,Connection,clusterApiUrl, LAMPORTS_PER_SOL,} from "@solana/web3.js"
import {ValidDepthSizePair,createAllocTreeIx,SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,SPL_NOOP_PROGRAM_ID,ConcurrentMerkleTreeAccount} from "@solana/spl-account-compression"
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'


import bs58 from 'bs58';


let connection: anchor.web3.Connection;
let wallet: anchor.web3.Keypair;
let merkleTreePub: anchor.web3.PublicKey;
let programId: anchor.web3.PublicKey;

async function main(){
    console.log("in main")
    connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    // wallet = await getOrCreateKeypair("USER_WALLET");
    // await airdropSolIfNeeded(wallet.publicKey);
}

export async function pushConfigOnChain(config: string){
    console.log(config);
    const temp = JSON.parse(JSON.stringify(config));
    const secretKey = new Uint8Array(JSON.parse('[203,137,160,95,76,186,104,8,142,118,129,17,11,40,72,87,73,226,204,227,246,113,250,105,57,95,230,244,210,140,154,216,229,184,102,40,94,29,57,213,147,3,51,191,46,199,113,132,24,211,250,23,93,31,20,42,27,99,222,191,148,67,75,218]'));
    let keypair: Keypair
    keypair = Keypair.fromSecretKey(secretKey)
    console.log(keypair);
    await main();

    const anchorWallet = new NodeWallet(keypair);
    console.log(anchorWallet);

    const provider =  new anchor.AnchorProvider(connection, anchorWallet, {
        commitment: 'processed',
    });
    anchor.setProvider(provider);

    merkleTreePub = new PublicKey(onchainData.protonTree.treeID);
    programId = new PublicKey(onchainData.protonTree.programID);
    const program = new Program(proton_program as Idl, programId);

    console.log("still here 1");
    await ConcurrentMerkleTreeAccount.fromAccountAddress(
        connection,
        merkleTreePub
    );
    console.log("still here 2");

    const [treeAuthority] = PublicKey.findProgramAddressSync(
        [merkleTreePub.toBuffer()],
        programId
    )
    console.log("still here 3");

    console.log("starting txn");
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
    };

    console.log(JSON.stringify(result));
}
const airdropSolIfNeeded = async(publicKey: PublicKey) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
  
    const balance = await connection.getBalance(publicKey)
    console.log("Current balance is", balance / LAMPORTS_PER_SOL)
  
    if (balance < 1 * LAMPORTS_PER_SOL) {
      try {
        console.log("Airdropping 2 SOL...")
  
        const txSignature = await connection.requestAirdrop(
          publicKey,
          2 * LAMPORTS_PER_SOL
        )
  
        const latestBlockHash = await connection.getLatestBlockhash()
  
        await connection.confirmTransaction(
          {
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: txSignature,
          },
          "confirmed"
        )
  
        const newBalance = await connection.getBalance(publicKey)
        console.log("New balance is", newBalance / LAMPORTS_PER_SOL)
      } catch (e) {
        console.log("Airdrop Unsuccessful, likely rate-limited. Try again later.")
      }
    }
  }