import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import {Repeat} from 'react-bootstrap-icons'
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  clusterApiUrl,
  SystemProgram,
  Transaction,
  sendAndConfirmRawTransaction
} from "@solana/web3.js"
import './SetupPage.css'
const SetupPage = ({ onCompleteSetup }) => {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState(generateUniqueUserId());
  const [walletData, setWalletData] = useState(generateWallet());

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const regenerateUserId = () => {
    setUserId(generateUniqueUserId());
  };

  const regenerateWallet = () => {
    setWalletData(generateWallet());
  };

 

  const handleCompleteSetup = async () => {
    if (name.trim() === '') {
        alert('Please enter your name');
        return;
    }
    const userProfile = {
      'uuid': `${userId}`,
      'name': name,
      'walletPub': walletData.publicKey.toString(),
      'wallet': Array.from(walletData.secretKey),
      'createdCommits': []
    }
    const wallet = await window.context.completeSetup(userProfile);
    
    onCompleteSetup();
  };

  return (
    <div className='setup-root'>
      <div className='setup-title'>Setup your Proton node on the Atom Network</div>
      <div>
        <input
          className='node-name'
          type="text"
          placeholder='Enter the name of your node'
          id="name"
          value={name}
          onChange={handleNameChange}
          required
        />
      </div>
      <div>
        <input className='user-id' type="text" id="userId" value={userId} readOnly />
        <Button variant="dark" size="sm" onClick={regenerateUserId}>
            <Repeat></Repeat>
        </Button>
      </div>
      <div>
        <input className='wallet-add' type="text" id="walletAddress" value={walletData.publicKey} readOnly />
        <Button variant="dark" size="sm" onClick={regenerateWallet}>
            <Repeat></Repeat>
        </Button>
      </div>
      <Button className='submit-btn' variant="success" size="sm" onClick={handleCompleteSetup}>
            Complete Setup
        </Button>
    </div>
  );
};

const generateUniqueUserId = () => {
  return `atom-${Math.random().toString(36).substr(2, 8)}`;
};

const generateWallet = () => {
  const keypair = Keypair.generate();
  return keypair;
};
export default SetupPage;