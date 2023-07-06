import React from "react";
import "../style.css";
import Webcam from 'react-webcam';
// import Camera from "react-html5-camera-photo";

export default function Home({ token, name }) {
  const [status, setStatus] = React.useState("");
  const [mapLink, setMapLink] = React.useState({ href: "", textContent: "" });

  const success = React.useCallback((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    setStatus("");
    setMapLink({
      href: `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`,
      textContent: `Latitude: ${latitude} °, Longitude: ${longitude} °`,
    });
  }, []);

  const error = React.useCallback(() => {
    setStatus("Unable to retrieve your location");
  }, []);

  const getLocation = React.useCallback(() => {
    setMapLink({ href: "", textContent: "" });

    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser");
    } else {
      setStatus("Locating…");
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }, [success, error]);

  // CAMERA
  const [cameraActive, setCameraActive] = React.useState(true);
  const videoConstraints = {
    width: 380,
    height: 720,
    facingMode: "user", 
  };
  const webcamRef = React.useRef(null);

  
  const captureImage = React.useCallback(() => {
    
    const imageSrc = webcamRef.current.getScreenshot();
    localStorage.setItem('capturedImage', imageSrc);
    setCameraActive(false); 
  }, [webcamRef]);

   const savedImage = localStorage.getItem('capturedImage');
  return (
    <>
      <div className="main">
        <div>
          <div className="heading">
            <h2>Welcome</h2>
            <h2>{name}</h2>
          </div>
          {/* <button onClick={startCamera}>Start Camera</button> */}
          {cameraActive ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      ) : (
        <h2>{savedImage}</h2>
      )} <br />
          <button onClick={captureImage} disabled = {!cameraActive}>Capture Image</button>

          <button className="primary-color" onClick={getLocation}>
            Current Location
          </button>
          <p id="status">{status}</p>
          <a id="map-link" href={mapLink.href}>
            {mapLink.textContent}
          </a>
        </div>
      </div>
    </>
  );
}
