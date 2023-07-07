import React, {  useState } from "react";
import "../style.css";


export default function Home({ token, name }) {
  //Location
  const [status, setStatus] = React.useState("");
  const [mapLink, setMapLink] = React.useState({ href: "", textContent: "" });
  const [submitted, setSubmitted] = useState(false);

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

  const [imgData, setImgData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = () => {
    setCameraActive(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          let video = document.getElementById("videoPreview");
          video.srcObject = stream;
          video.play();
        })
        .catch((error) => {
          console.log("Enable to access camera: ", error);
        });
    }
  };

  const capturePhoto = () => {
    let video = document.getElementById("videoPreview");
    let canvas = document.getElementById("photoCanvas");
    let context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    let dataURL = canvas.toDataURL("image/png");
    setImgData(dataURL);
    setCameraActive(false);
    video.srcObject.getTracks()[0].stop();
  };

  const submit = React.useCallback(() => {
    if (!imgData && !mapLink.href) {
      document.querySelector("p").textContent = "Provide photo and location";
    } else if (!imgData) {
      document.querySelector("p").textContent = "please capture Photo";
    } else if (!mapLink.href) {
      document.querySelector("p").textContent = "please Provide location";
    } else {
      console.log("Submitted Successfully");
    }
    setSubmitted(true);
  },[imgData, mapLink.href]);

   const isButtonDisabled = submitted || !imgData || !mapLink.href;

  return (
    <>
      <div className="main">
        <div>
          <div className="heading">
            <h2>Welcome</h2>
            <h2>{name}</h2>
            <p></p>
          </div>
          {!cameraActive && (
            <div>
              <button onClick={startCamera} className="primary-color">
                Start Camera
              </button>
            </div>
          )}

          {cameraActive && (
            <div>
              <video id="videoPreview" width="100%" autoPlay></video>
              <button onClick={capturePhoto} className="primary-color">
                Capture Photo
              </button>
            </div>
          )}

          <button className="primary-color" onClick={getLocation}>
            Current Location
          </button>
          <p id="status">{status}</p>
          <a id="map-link" href={mapLink.href}>
            {mapLink.textContent}
          </a>

          {imgData && (
            <div>
              <h2>Preview</h2>
              <img src={imgData} alt="Captured" style={{ maxWidth: "100%" }} />
            </div>
          )}
          <canvas id="photoCanvas" style={{ display: "none" }}></canvas>

          {!submitted && (
            <form onSubmit={submit}>
              <button type="submit" className="primary-color" disabled={isButtonDisabled}>
                Submit
              </button>
            </form>
          )}

          
        </div>
      </div>
    </>
  );
}
