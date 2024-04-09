import React, { useState, useEffect } from 'react';
import { fetchConfig } from '../../../onchain-interactions/onchainInteractions';
import Skelton from '@mui/material/Skeleton'
import Card from 'react-bootstrap/Card';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchConfig();
        console.log(response);
        setData(response);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {isLoading ? (
        <div>
          <h3>Current Deployments</h3>
          <Skelton variant="rectangular" height={200} />  
        </div>
      ) : (
        <div>
        <h3>Current Deployments</h3>
        {JSON.parse(data).map((item, index) => (
          <div key={index} className="proton-item">
            {item.createdCommits.length>0 ?<Card className='quicklink-card' bg='dark' text='light'>
                  <Card.Body>
                    <Card.Text onClick={() => handleProtonSelect(index)}>
                      <div>Proton Router Address: {item.protonConfig.protonRouterAddress}</div>
                      <div><a href={item.createdCommits[0]}>Deployed Link: {item.createdCommits[0]}</a></div>
                      
                      <h6 className='tags'>
                        <span className='tag-span'>{item.protonConfig.resources.cpu} cores</span>
                        <span className='tag-span'>{item.protonConfig.resources.ram} GB RAM</span>
                      </h6>
                    </Card.Text>
                  </Card.Body>
            </Card>:null}
          </div>
        ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;