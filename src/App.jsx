import "./App.css";

import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Footer from "./components/Footer";
import AddStory from "./components/AddStory";
import ReadStory from "./components/ReadStory";
import WonderShelf from "./components/WonderShelf";

function App() {
  return (
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wonderShelf" element={<WonderShelf />} />
          <Route path="/addStory" element={<AddStory />} />
          <Route path="/readStory" element={<ReadStory />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
