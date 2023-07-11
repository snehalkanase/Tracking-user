import React, { useState } from "react";
import "../style.css";
import { BlobServiceClient } from "@azure/storage-blob";
import { AnonymousCredential } from "@azure/storage-blob";


export default function Home({ token, name }) {
  //Location
  const [status, setStatus] = React.useState("");
  const [mapLink, setMapLink] = React.useState({ href: "", textContent: "" });
  const [submitted, setSubmitted] = useState(false);

  // const success = React.useCallback((position) => {
  //   const latitude = position.coords.latitude;
  //   const longitude = position.coords.longitude;

  //   setStatus("");
  //   setMapLink({
  //     href: `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`,
  //     textContent: `Latitude: ${latitude} °, Longitude: ${longitude} °`,
  //   });
  // }, []);

  // const error = React.useCallback(() => {
  //   setStatus("Unable to retrieve your location");
  // }, []);

  // const getLocation = React.useCallback(() => {
  //   setMapLink({ href: "", textContent: "" });

  //   if (!navigator.geolocation) {
  //     setStatus("Geolocation is not supported by your browser");
  //   } else {
  //     setStatus("Locating…");
  //     navigator.geolocation.getCurrentPosition(success, error);
  //   }
  // }, [success, error]);

  // CAMERA

  const [imgData, setImgData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);

  console.log(process.env.REACT_APP_NAME);
  console.log(process.env.REACT_APP_STORAGE_ACCOUNT_NAME);

  const startCamera = () => {
    setImgData(null);
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
    setCaptureCount(captureCount + 1);
  };

  const resetCapture = () => {
    setImgData(null);
    setCaptureCount(0);
  };

  async function uploadImageToBlobAzur(imgData, position) {
    const accountName = process.env.REACT_APP_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.REACT_APP_STORAGE_ACCOUNT_KEY;
    const containerName = process.env.REACT_APP_STORAGE_CONTAINER_NAME;

    const anonymousCredential = new AnonymousCredential(accountName, accountKey);

    
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    anonymousCredential
  );

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const timestamp = Date.now();
    const filename = `IMG_${timestamp}_${position.latitude}-${position.longitude}.jpg`;
    console.log(filename);

    const base64Data = imgData.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    console.log(byteArray);
    const blob = new Blob([byteArray], { type: "image/jpg" });

    const blockBlobClient = containerClient.getBlockBlobClient(`Expenditures/Images/${filename}`);
    await blockBlobClient.uploadData(blob);

    return blockBlobClient.url;
  }

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser");
      } else {
        navigator.geolocation.getCurrentPosition(
          (currentPosition) => {
            const position = {
              latitude: currentPosition.coords.latitude,
              longitude: currentPosition.coords.longitude,
            };
            resolve(position);
          },
          (error) => {
            reject(`Geolocation error: ${error.message}`);
          }
        );
      }
    });
  };

  const submit = React.useCallback(async () => {
    setMapLink({ href: "", textContent: "" });
    const currentPosition = await getLocation();

    const imageUrl = await uploadImageToBlobAzur(imgData, currentPosition);
  }, [imgData]);

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
          {!cameraActive && captureCount === 0 && (
            <div>
              <button onClick={startCamera} className="primary-color">
                Take Photo
              </button>
            </div>
          )}
          {!cameraActive && captureCount > 0 && (
            <div>
              <button onClick={startCamera} className="primary-color">
                Retake Photo
              </button>
            </div>
          )}

          {cameraActive && (
            <div>
              <video id="videoPreview" width="100%" autoPlay></video>
              <button onClick={capturePhoto} className="primary-color">
                Click
              </button>
            </div>
          )}

          {/* <button className="primary-color" onClick={getLocation}>
            Current Location
          </button>
          <p id="status">{status}</p>
          <a id="map-link" href={mapLink.href}>
            {mapLink.textContent}
          </a> */}

          {imgData && (
            <div>
              <h2>Preview</h2>
              <img
                src={imgData}
                alt="Captured"
                style={{ maxWidth: "200px", height: "250px" }}
              />
            </div>
          )}
          <canvas id="photoCanvas" style={{ display: "none" }}></canvas>

          {imgData && (
            <button onClick={submit} className="primary-color">
              Submit
            </button>
          )}
        </div>
      </div>
    </>
  );
}
