import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const WebCam = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState([]);
  const [facingMode, setFacingMode] = useState("user");
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [address, setAddress] = useState("");

  const API_KEY = "zq4mCj4fsjIUVGfck2ZL34Jgd0oNeFcYhmbsHeRGa-Q";

  const handleStartCaptureClick = useCallback(() => {
    if (webcamRef.current && webcamRef.current.stream) {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setCapturing(false);
    }
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleCaptureSnapshot = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef, setImgSrc]);

  const handleDevices = useCallback(
    (mediaDevices) => {
      const videoDevices = mediaDevices.filter(
        ({ kind }) => kind === "videoinput"
      );
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setDeviceId(videoDevices[0].deviceId);

        const frontFacing = videoDevices[0].label
          .toLowerCase()
          .includes("front");
        setFacingMode(frontFacing ? "user" : "environment");
      }
    },
    [setDevices, setDeviceId, setFacingMode]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          fetch(
            `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=en-US&apiKey=${API_KEY}`
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("API Response:", data);
              if (data.items && data.items.length > 0) {
                setAddress(data.items[0].address.label);
              } else {
                console.error("No address found");
              }
            })
            .catch((error) => console.error("Error fetching address:", error));
        },
        (error) => {
          console.error("Error getting location: ", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [handleDevices, API_KEY]);

  return (
    <div className="max-w-[50%]">
      {devices.map((device, key) => (
        <div key={key}>
          <Webcam
            audio={false}
            mirrored={true}
            videoConstraints={{
              deviceId: device.deviceId,
              facingMode: facingMode,
            }}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
          />
          <p className="font-bold">
            {device.label || `Device ${key + 1}`} (
            {facingMode === "user" ? "Front" : "Back"} Camera)
          </p>
          <p className="font-bold">Latitude: {location.latitude}</p>
          <p className="font-bold">Longitude: {location.longitude}</p>
          <p className="font-bold">Location: {address}</p>

          {/* {location.latitude && location.longitude && (
            <iframe
              width="600"
              height="450"
              style={{ border: 0 }}
              src={`https://www.here.com/maps/embed?apiKey=${API_KEY}&c=${location.latitude},${location.longitude}&z=14`}
              allowFullScreen
            ></iframe>
          )} */}

          <button
            className="bg-blue-600 text-white px-4 py-2 text-lg font-serif"
            onClick={handleCaptureSnapshot}
          >
            Capture Snapshot
          </button>

          {capturing ? (
            <button
              className="bg-white border border-black text-white px-4 py-2 text-lg font-serif"
              onClick={handleStopCaptureClick}
            >
              Stop Capture
            </button>
          ) : (
            <button
              className="bg-black text-white px-4 py-2 ml-4 text-lg font-serif"
              onClick={handleStartCaptureClick}
            >
              Start Capture
            </button>
          )}
          {recordedChunks.length > 0 && (
            <button
              className="bg-red-600 ml-4 text-white px-4 py-2 text-lg font-serif"
              onClick={handleDownload}
            >
              Download
            </button>
          )}
          {imgSrc && (
            <div>
              <h3>Captured Snapshot</h3>
              <img src={imgSrc} alt="Captured snapshot" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WebCam;
