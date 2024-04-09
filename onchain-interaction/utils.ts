import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    clusterApiUrl,
  } from "@solana/web3.js"
  
  import * as fs from "fs"
  import {
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js"

  require('dotenv').config()

  export async function getOrCreateKeypair(walletName: string): Promise<Keypair> {
    // Check if secretKey for `walletName` exist in .env file
    const envWalletKey = process.env[walletName]
  
    let keypair: Keypair
  
    // If no secretKey exist in the .env file for `walletName`
    if (!envWalletKey) {
      console.log(`Writing ${walletName} keypair to .env file...`)
  
      // Generate a new keypair
      keypair = Keypair.generate()
  
      // Save to .env file
      fs.appendFileSync(
        ".env",
        `\n${walletName}=${JSON.stringify(Array.from(keypair.secretKey))}`
      )
    }
    // If secretKey already exists in the .env file
    else {
      // Create a Keypair from the secretKey
      console.log(typeof(envWalletKey));
      const secretKey = new Uint8Array(JSON.parse(envWalletKey))
      keypair = Keypair.fromSecretKey(secretKey)
    }
  
    // Log public key and return the keypair
    console.log(`${walletName} PublicKey: ${keypair.publicKey.toBase58()}`)
    return keypair
  }

  export async function airdropSolIfNeeded(publicKey: PublicKey) {
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

  export async function transferSolIfNeeded(sender: Keypair, receiver: Keypair) {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed")
  
    const balance = await connection.getBalance(receiver.publicKey)
    console.log("Current balance is", balance / LAMPORTS_PER_SOL)
  
    if (balance < 0.5 * LAMPORTS_PER_SOL) {
      try {
        let ix = SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey: receiver.publicKey,
          lamports: LAMPORTS_PER_SOL,
        })
  
        await sendAndConfirmTransaction(connection, new Transaction().add(ix), [
          sender,
        ])
  
        const newBalance = await connection.getBalance(receiver.publicKey)
        console.log("New balance is", newBalance / LAMPORTS_PER_SOL)
      } catch (e) {
        console.log("SOL Transfer Unsuccessful")
      }
    }
  }
