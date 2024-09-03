import CameraStream from "./Components/CameraStream";
import FileUpload from "./Components/FileUpload";
import HeroSection from "./Components/HeroSection";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      {/* <div className="flex justify-center items-center">
        <WebCam />
      </div> */}
      <Routes>
        <Route path="/" Component={HeroSection} />
        <Route path="/webcam" Component={CameraStream} />
        <Route path="/upload" Component={FileUpload} />
      </Routes>
    </Router>
  );
}

export default App;
