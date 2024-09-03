import { useRef, useEffect, useState } from "react";
import Dropzone from "react-dropzone";

const MyDropzone = () => {
  const maxSize = 20 * 1024 * 1024; // 20MB in bytes

  const handleDrop = (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      console.error(
        "Some files were rejected due to size or type restrictions."
      );
    }

    console.log("Accepted Files: ", acceptedFiles);
  };

  return (
    <Dropzone onDrop={handleDrop} accept={{ "video/*": [] }} maxSize={maxSize}>
      {({ getRootProps, getInputProps }) => (
        <section>
          <div
            {...getRootProps()}
            className="border-dashed border-2 border-gray-500 p-4"
          >
            <input {...getInputProps()} />
            <p>
              Drag and drop some video files here, or click to select files
              (Max: 20MB)
            </p>
          </div>
        </section>
      )}
    </Dropzone>
  );
};

const CameraStream = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [snapshots, setSnapshots] = useState([]);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isMirrored, setIsMirrored] = useState(true);

  useEffect(() => {
    const startCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCameraStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const captureSnapshot = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Apply mirroring if needed
      context.translate(canvas.width, 0);
      context.scale(-1, 1);

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image URL
      const imageUrl = canvas.toDataURL("image/png");
      setSnapshots((prev) => [...prev, imageUrl]);
    }
  };

  const toggleSnapshots = () => {
    setShowSnapshots((prev) => !prev);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const toggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`border-2 w-[50%] border-gray-500 ${
          isMirrored ? "transform scale-x-[-1]" : ""
        }`}
        style={{ width: "100%", height: "auto" }}
      />
      <div className="flex gap-3 max-[768px]:flex-col">
        <div className="flex gap-4">
          <button
            onClick={captureSnapshot}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Capture Snapshot
          </button>
          <button
            onClick={toggleCamera}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Toggle Camera
          </button>
        </div>
        <button
          onClick={toggleMirror}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Toggle Mirror
        </button>
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={toggleSnapshots}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          {showSnapshots ? "Hide Snapshots" : "View Snapshots"}
        </button>
      </div>
      {showSnapshots && snapshots.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {snapshots.map((snapshot, index) => (
            <img
              key={index}
              src={snapshot}
              alt={`Snapshot ${index + 1}`}
              className="border-2 border-gray-500 w-full h-auto"
            />
          ))}
        </div>
      )}
      <MyDropzone />
    </div>
  );
};

export default CameraStream;
