import React, { useEffect, useState } from 'react';
import { Row, Col, Nav, Navbar, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { FaRegCopy, FaCloudDownloadAlt } from 'react-icons/fa';
import Home from './Home';
import Dashboard from './Dashboard';

const App = () => {
  const [activeLink, setActiveLink] = useState('homeroot');
  const [userName, setUserName] = useState('');
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    const userData = async() =>{
      const temp = await window.context.fetchUserData();
      const tempJson = JSON.parse(temp);
      setUserName(tempJson["uuid"]);
      setWalletId(tempJson["walletPub"]);
    }
    userData();
  }, []);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  const renderContent = () => {
    switch (activeLink) {
      case 'homeroot':
        return <Home></Home>;
      case 'dashboard':
        return <Dashboard></Dashboard>
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg" className="py-1 p-2">
        <Navbar.Text className="me-auto">{userName}</Navbar.Text>
        <Navbar.Text className="ms-auto">
          <span className="wallet-id-container mr-2">{walletId}</span>
          <Button size='sm' variant='dark'><FaRegCopy className="ml-2 squircle-icon text-light" /></Button>
          <Button size='sm' variant='dark'><FaCloudDownloadAlt className="ml-2 squircle-icon text-light" /></Button>
        </Navbar.Text>
      </Navbar>
      <Row className="vh-100 m-0">
        <Col md={2} className="bg-light p-0">
          <Nav className="flex-column">
            <Nav.Link onClick={() => handleLinkClick('homeroot')} className={`py-3 border-bottom ${activeLink === 'home' ? 'font-weight-bold' : ''}`}>
              Home
            </Nav.Link>
            <Nav.Link onClick={() => handleLinkClick('dashboard')} className={`py-3 border-bottom ${activeLink === 'dashboard' ? 'font-weight-bold' : ''}`}>
              Dashboard
            </Nav.Link>
          </Nav>
        </Col>
        <Col md={10} className="p-4">
          {renderContent()}
        </Col>
      </Row>
    </div>
  );
};

export default App;