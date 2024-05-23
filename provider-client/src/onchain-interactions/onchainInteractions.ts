import axios from 'axios';
import onchainData from './tree-data.json';
import bs58 from 'bs58';
export async function fetchConfig() {
    let id = onchainData.protonTree.treeID;
    // const response = await fetch(`https://api-devnet.helius.xyz/v0/addresses/${id}/transactions?api-key=`,{
    //     method: 'GET',
    //     headers: {},
    // });
    const response = await axios.get(`https://api-devnet.helius.xyz/v0/addresses/${id}/transactions?api-key=`);
    let data = await response.data;
    console.log(data);
    const result = data.filter((item: { instructions: string | any[]; }) => item.instructions.length === 1)
    .map((item: { instructions: { data: any; }[]; }) => {
      const instructionData = item.instructions[0].data;
      const decodedData = new TextDecoder().decode(bs58.decode(instructionData));
    //   const decodedData = Buffer.from(bs58.decode(instructionData)).toString('utf8');
      const start = decodedData.indexOf('{');
      const end = decodedData.lastIndexOf('}') + 1;
      const jsonData = JSON.parse(decodedData.slice(start, end));
      return { data: jsonData };
    });
    const simplifiedArray = result.map((item: { data: any; }) => item.data);
    return JSON.stringify(simplifiedArray);
}
