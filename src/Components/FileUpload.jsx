import { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    let errorMsg = "";

    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errorMsg = "Only image files are allowed.";
      } else if (file.size > 30 * 1024 * 1024) {
        errorMsg = "Each image must be smaller than 30MB.";
      } else {
        validFiles.push(file);
      }
    });

    if (errorMsg) {
      setError(errorMsg);
      setFiles([]);
    } else {
      setError("");
      setFiles(validFiles);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (files.length > 0) {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("file", file));

      try {
        const response = await axios.post(
          "http://localhost:5000/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
          }
        );

        const url = URL.createObjectURL(response.data);
        setUploadResults(url);
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    } else {
      setError("Please select valid image files.");
    }
  };

  function UploadIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
    );
  }

  return (
    <div className="flex flex-col items-center p-8">
      <form onSubmit={handleSubmit} className="w-[50%]">
        <div className="mb-4">
          <div className="grid gap-2">
            <label htmlFor="file" className="text-sm font-medium">
              Upload Image
            </label>
            <div className="group relative flex items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-md bg-background hover:border-primary transition-colors">
              <div className="flex flex-col items-center space-y-2 text-muted-foreground group-hover:text-primary">
                <UploadIcon className="w-8 h-8" />
                <p className="text-sm font-mono">
                  {"Drag and drop an image or click to upload".toUpperCase()}
                </p>
              </div>
              <input
                id="file"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                multiple
              />
            </div>
            <div className="text-sm text-muted-foreground">
              No file selected
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-full"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Images"}
        </button>
      </form>
      {files.length > 0 && (
        <div className="mt-4 w-max flex justify-center items-center flex-col">
          <h3 className="text-2xl font-bold mb-2 flex self-start">
            Files to Upload:
          </h3>
          <ul className="list-disc pl-4 font-serif text-xl">
            {files.map((file, index) => (
              <li key={index} className="mb-1">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </li>
            ))}
          </ul>
        </div>
      )}
      {uploadResults && (
        <div className="mt-4">
          <h3 className="text-2xl font-bold mb-2">Detection Results:</h3>
          <img
            src={uploadResults}
            alt="Processed"
            style={{ maxWidth: "60%" }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
