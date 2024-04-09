import React from 'react';
import { Route, Router, Routes } from 'react-router-dom';

const Home = () => <div style={{color: "white"}}>This is the home area.</div>;
const Dashboard = () => <div>
  <h2>Dashboard</h2>
  <p>This is the dashboard area, when the dashboard link is selected from the sidebar</p>
</div>;

const MainContent = () => {
  return (
    <div>
        <Routes>
          <Route exact path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
        </Routes>
    </div>
  );
};

export default MainContent;