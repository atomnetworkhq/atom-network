import React, { useEffect, useState} from 'react'
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from '@mui/material/Button'
import * as yaml from 'js-yaml'
import './Home.css'
export default function Home() {
  const [isDockerInstalled, setIsDockerInstalled] = useState(false);
  const [runningContainers, setRunningContainers] = useState([]);
  const [newNotification, setNewNotification] = useState(null);
  const [providerPublicRouterAddress, setProviderPublicRouterAddress] = useState(null);
  useEffect(()=>{
    const id = setInterval(checkIfDockerIsRunning,1000);
    const id2 = setInterval(getRunningContainers,1000);
    const id3 = setInterval(fetchRouter, 1000);
    console.log(runningContainers);
    return()=>{
      clearInterval(id);
      clearInterval(id2);
      clearInterval(id3);
    }
  },[])
  function getRunningContainers(){
    window.context.getRunningContainers().then(data=>setRunningContainers(data));
  }
  function checkIfDockerIsRunning(){
    window.context.isDockerInstalled().then(data=>{
      console.log(data);
      setIsDockerInstalled(data);
    });
  }
  function fetchRouter(){
    window.context.fetchUserData().then((data)=>{
      let temp = JSON.parse(data);
      setProviderPublicRouterAddress(temp["zrok_url"]);
    });
  }
  const handleAccept = async() =>{
    await window.context.runDocker(newNotification);
    setNewNotification(null);
  }
  window.context.getCommitConsent((value)=>{
    setNewNotification(value);
  })
  return (
    <>
      {providerPublicRouterAddress !== null && <p className='public-router'>You are live to the world at: {providerPublicRouterAddress}</p>}
      {isDockerInstalled == false && <p>Docker is not running!</p>}
      {isDockerInstalled == true && runningContainers.length === 0 && <p>No Containers running!</p>}
      {isDockerInstalled == true && runningContainers.length > 0 &&
      
        <div>
          {runningContainers.map(container =>{
            return(
              <div>
                <p>{container['Id'].slice(0,10)}</p>
                <p>{container['Imade']}</p>
                <p>{container['RAM']}</p>
                <p>{container['Status']}</p>
              </div>
            )
          })}
        </div>
      
      }
      {newNotification!==null && <>
        <Card className='quicklink-card' bg='dark' text='light'>
                <Card.Body>
                  <Card.Text>
                    <p>New Incoming Request</p>
                    {/* <h6 className='tags'>
                      <span className='tag-span'>{item.protonConfig.resources.cpu} cores</span>
                      <span className='tag-span'>{item.protonConfig.resources.ram} GB RAM</span>
                    </h6> */}
                    <p>{newNotification}</p>
                    <div>
                      <span className='notification-btn'>
                        <Button onClick={handleAccept} variant="text">Accept</Button>
                        <Button variant="text">Reject</Button>
                      </span>
                      <span>

                      </span>
                    </div>
                  </Card.Text>
                </Card.Body>
          </Card>
      </>}

    </>
  )
}
