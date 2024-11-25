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
          {/* Updated route to handle dynamic story IDs */}
          <Route path="/readStory/:id" element={<ReadStory />} />
          {/* Placeholder route for individual story pages */}
          <Route
            path="/readStory/:id/page/:pageNumber"
            element={<div>Page View Placeholder</div>}
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;
