import { createContext, useContext, useState, useEffect } from "react";

import api from "../api";

const StoriesContext = createContext();

// CREATE A WRAPPER COMPONENT
function StoriesProviderWrapper(props) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling

  // Fetch stories from the backend API when the component loads
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await api.get("/stories"); // Replace with your backend URL
        setStories(data); // Save fetched stories in the state
      } catch (error) {
        setError("Failed to fetch stories. Please try again later."); // Handle error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchStories(); // Call the fetch function
  }, []); // Runs once when the component mounts

  /* SET UP THE PROVIDER */
  return (
    <StoriesContext.Provider value={{ stories, setStories, loading, error }}>
      {props.children}
    </StoriesContext.Provider>
  );
}

export { StoriesProviderWrapper };

export function useStories() {
  const context = useContext(StoriesContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }
  return context;
}
