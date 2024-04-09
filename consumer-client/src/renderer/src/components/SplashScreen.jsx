import React, { useState, useEffect } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar';
import './SplashScreen.css'
const SplashScreen = (props) => {

  return (
    <div className='splash-root'>
        <div className='splash-title'>Atom Network</div>
        <ProgressBar className='progressBar' variant="success" animated now={props.progress} />
    </div>
  )
}

export default SplashScreen;
