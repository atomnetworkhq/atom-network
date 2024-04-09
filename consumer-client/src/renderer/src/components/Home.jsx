import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import './Home.css'
import {fetchConfig} from '../../../onchain-interactions/onchainInteractions'
import Skelton from '@mui/material/Skeleton'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Info from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Home() {
  const quickLinks = ["Dashboard", "New Commit", "Integrations", "Wallet & Settings"];
  const steps = ['Configure the deployment', 'Select providers', "Verify"];
  const [activeStep, setActiveStep] = React.useState(0);
  const [dockerComposeFile, setDockerComposeFile] = useState(null);
  const [peerConnect, setpeerConnect] = useState(null);
  const [nodeData, setNodeData] = useState(null);
  const [selectedProton, setSelectedProton] = useState(null);
  const handleFileChange = (event) => {
    setDockerComposeFile(event.target.files[0]);
    console.log(dockerComposeFile);
  };
  const handleSubmit = async () => {
    if (dockerComposeFile) {
      console.log(dockerComposeFile);
      console.log(dockerComposeFile.path);
      const data = await window.context.fetchDockerCompose(`${dockerComposeFile.path}`);
      console.log(data);
      console.log(selectedProton["protonConfig"]["protonRouterAddress"]);
      axios({
        method: 'post',
        url: selectedProton["protonConfig"]["protonRouterAddress"],
        data: `${data}`,
        headers:{"Content-Type":"text/plain"}
      });

      console.log(response);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  const fetchNodes=async()=>{
    const data = await fetchConfig();
    setNodeData(data);
  }
  const handleProtonSelect = (index) => {
    const temp = JSON.parse(nodeData);
    setSelectedProton(temp[index]);
  };
  const handleNodeData = () =>{
    if(nodeData===null){
      fetchNodes();
    }
    if(nodeData===null){
      return(
        <>
          <div className='skelton-box'>
            <Skelton variant="rectangular" height={118} />
          </div>
        </>
      )
    }
    else{
      return(
        <>
        {/* {nodeData} */}
        {JSON.parse(nodeData).map((item, index) => (
        <div key={index} className="proton-item">
          <Card className='quicklink-card' bg='dark' text='light'>
                <Card.Body>
                  <Card.Text onClick={() => handleProtonSelect(index)}>
                    Proton Router Address: {item.protonConfig.protonRouterAddress}
                    <h6 className='tags'>
                      <span className='tag-span'>{item.protonConfig.resources.cpu} cores</span>
                      <span className='tag-span'>{item.protonConfig.resources.ram} GB RAM</span>
                    </h6>
                  </Card.Text>
                </Card.Body>
          </Card>
        </div>
      ))}
      {selectedProton && (
        <div className="selected-proton">
          <h4>Selected Proton</h4>
          <p>Proton Router Address: {selectedProton.protonConfig.protonRouterAddress}</p>
          <p>Proton UUID: {selectedProton.protonConfig.protonUUID}</p>
        </div>
      )}
        </>
      )
    }
  }

  const handleVerify = () =>{
    if(selectedProton===null){
      return (<Skelton variant="rectangular" height={200} />)
    }
    else{
      return (
      <>
        <p>Proton Public Key Address: {selectedProton.protonConfig.protonPubKeyAddress}</p>
        <p>Proton Router Address: {selectedProton.protonConfig.protonRouterAddress}</p>
        <p>Proton Unique ID: {selectedProton.protonConfig.protonUUID}</p>
        <p>Proton CPU available: {selectedProton.protonConfig.resources.cpu}</p>
        <p>Proton RAM available: {selectedProton.protonConfig.resources.ram}</p>
      </>
    )
    }
  }


  return (
    <div>
        <p>Create New Deployment</p>
        {/* <Row xs={1} md={2} className="g-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Col key={idx}>
              <Card className='quicklink-card' bg='dark' text='light'>
                <Card.Body>
                  <Card.Text>
                    {quickLinks[idx]}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row> */}
        

        <Card className='quicklink-card create-deployment' bg='dark' text='light'>
                <Card.Body>
                  <Card.Text>
                  {/* <Skelton variant="text" sx={{ fontSize: '1rem' }} /> */}

                  <Box sx={{ width: '100%' }}>
                    <Stepper activeStep={activeStep}>
                      {steps.map((label, index) => {
                        const stepProps = {};
                        const labelProps = {};
                        return (
                          <Step key={label} {...stepProps}>
                            <StepLabel {...labelProps}><span className='stepLabel'>{label}</span></StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>

                    {activeStep === steps.length ? (
                      <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>
                          Click Submit to deploy your services
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                          <Box sx={{ flex: '1 1 auto' }} />
                          <Button onClick={handleSubmit}>Connect now!</Button>
                        </Box>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>
                          {activeStep===0 && 
                            <>
                              <div className='upload-btn'> 
                                <Button
                                component="label"
                                role={undefined}
                                variant="contained"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}
                              >
                                Upload your docker compose file
                                <VisuallyHiddenInput onChange={handleFileChange} type="file" />
                              </Button>
                              {dockerComposeFile===null?<></>:<p>{dockerComposeFile.name} file selected</p>}
                              </div>
                            </>
                          }
                          {activeStep===1 &&
                            <>
                              <div>
                                {handleNodeData()}
                              </div>
                            </>
                          }
                          {activeStep===2 && 
                            <>
                              <div>
                                {handleVerify()}
                              </div>
                            </>
                          }
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                          <Button
                            color="inherit"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            sx={{ mr: 1 }}
                          >
                            Back
                          </Button>
                          <Box sx={{ flex: '1 1 auto' }} />
                          <Button onClick={handleNext}>
                            {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
                          </Button>
                        </Box>
                      </React.Fragment>
                    )}
                  </Box>
                  </Card.Text>
                </Card.Body>
        </Card>
                
    </div>
  )
}
