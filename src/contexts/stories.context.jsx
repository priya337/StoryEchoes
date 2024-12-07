import { createContext, useContext, useState, useEffect } from "react";
import { useUsers } from "./user.context";
import api from "../api";

const StoriesContext = createContext();

// CREATE A WRAPPER COMPONENT
function StoriesProviderWrapper(props) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [refresh, setRefresh] = useState(0);

  const { userDetails } = useUsers();

  // Fetch stories from the backend API when the component loads
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await api.get("/stories"); // Replace with your backend URL

        if (userDetails.bookIds && data.length > 0) {
          let checkLikedStories = data.map((oneStory) => {
            oneStory.liked = false;
            if (userDetails.bookIds.includes(oneStory.id)) {
              oneStory.liked = true;
            }
            return oneStory;
          });

          setStories([...checkLikedStories]);
        } else {
          setStories(data); // Save fetched stories in the state
        }
      } catch (error) {
        setError("Failed to fetch stories. Please try again later."); // Handle error
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };

    fetchStories(); // Call the fetch function
  }, [refresh, userDetails]); // Runs when the component mounts, userDetails changes & refresh is requested

  return (
    <StoriesContext.Provider value={{ stories, loading, error, setRefresh }}>
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
