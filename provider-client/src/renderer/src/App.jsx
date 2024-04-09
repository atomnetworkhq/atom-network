import SplashScreen from "./components/SplashScreen"
import React, {useState, useEffect} from "react";
import Homepage from "./components/Homepage.jsx"
import SetupPage from "./components/SetupPage.jsx";
import './App.css'
function App() {
  const [isFolderCreated, setIsFolderCreated] = useState(false);
  const [isUserProfileCreated, setIsUserProfileCreated] = useState(false);
  const [isWalletCreated, setIsWalletCreated] = useState(true);

  const [loading, setLoading] = useState(true);
  const [shouldRedirectToSetup, setShouldRedirectToSetup] = useState(false);
  const [shouldRedirectToHomepage, setShouldRedirectToHomepage] = useState(false);

  const [showHomePage, setShowHomePage] = useState(false);

  const checkFolder = async () =>{
    try {
      const returnValue = await window.context.confirmFolder();
      setIsFolderCreated(returnValue);
    } catch (error) {
      console.log('Atom Folder not found',error);
    }
  };

  const checkUserProfile = async () =>{
    try {
      const returnValue = await window.context.confirmUserProfile();
      setIsUserProfileCreated(returnValue);
    } catch (error) {
      console.log('User profile not found',error);
    }
  };


  const handleCompleteSetup = async () => {
    setShowHomePage(true);
    setIsFolderCreated(true);
    setIsUserProfileCreated(true);
    setIsWalletCreated(true);
  };

  useEffect(() => {
    checkFolder();
    checkUserProfile();
    setTimeout(() => {
      setLoading(false);
    }, 2000); 
  }, []);


  return (
    <div>
      { loading && (<SplashScreen progress = {100}></SplashScreen>)}
      {(!isFolderCreated || !isWalletCreated || !isUserProfileCreated) && !showHomePage && !loading && (<SetupPage onCompleteSetup={handleCompleteSetup} />)}
      {isFolderCreated && isWalletCreated && isUserProfileCreated && (<Homepage/>)}
    </div>
  );

}

export default App

