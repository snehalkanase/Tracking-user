import jwt_decode from "jwt-decode";
import Error from './pages/error';
import Home from './pages/homes';
import React, { useEffect, useState } from 'react';



function App() {
  const [screen, setScreen] = useState('Initial');
  const [name, setName] = useState('');
  const queryParameters = new URLSearchParams(window.location.search);
  const token = queryParameters.get('token');
const checkPermission = React.useCallback(()=>{

  if('geolocation' in navigator){
    navigator.permissions.query({name: 'geolocation'}).then(result => {
       if(result.state === "granted"){
         setScreen('Home');
       }else if(result.state === 'prompt'){
        setScreen('No-GPS');
        requestPermission()
       } else{
        setScreen('Error')
       }
    }).catch(error => {
      console.error('Error checking location permission:', error);
    });
  }
  else{
    setScreen('No-GPS')
  }
},[]);

  useEffect(() => {
    try {
      const decoded = jwt_decode(token);
      console.log(decoded);
      setName(decoded.name);
      const expiryTime = decoded.exp;
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime < expiryTime) {
        checkPermission();
      } else {
        setScreen('Expired');
      }
    } catch (error) {
      setScreen('Invalid');
    }
  },[token, checkPermission]);


  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      (position)=>{
        console.log(position);
        setScreen('Home') 
      },
      (error)=>{
        console.log("This is an error.")
        console.log(error)
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  const getLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
    } else {
      navigator.geolocation.getCurrentPosition((position) =>{
        console.log(position);
        setScreen('Home')
      });
    }
  }, [])

  switch (screen) {
    case 'Initial':
      return (
        <div>
          <Error image={'expired.svg'}  subTitle={'Loading'} />
        </div>
      );
    case 'Home':
      return (
        <div>
          <Home name={name} />
        </div>
      );
    case 'Expired':
      return (
        <div>
          <Error
            image={'expired.svg'}
            title={'Oops, this link is expired!'}
            subTitle={'Please request a new link from an administrator'}
          />
        </div>
      );
    case 'Invalid':
      return (
        <div>
          <Error image={'invalid.svg'} title={'Test'} subTitle={'Test SubTitle'} />
        </div>
      );
    case 'No-GPS':
      return (
        <div className="main">
          <div>
            <img src={'/img/no_gps.svg'} alt="" className='svg' />
            <h3>No GPS!</h3>
            <h4>Satellite can't find you</h4>
            <button onClick={getLocation} className="primary-color" >Turn on your location</button>
        </div>
        </div>
      );
    default:
      return (
        <div>
          <Error image={'no_gps.svg'} title={'Error'} subTitle={"Something went wrong"} />
        </div>
      );
  }

}
export default App;
