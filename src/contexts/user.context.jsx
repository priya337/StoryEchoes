import { createContext, useContext, useState, useEffect } from "react";

import api from "../api";

const UserContext = createContext();

// CREATE A WRAPPER COMPONENT
function UserProviderWrapper(props) {
  const [user, setUser] = useState();
  const [userDetails, setUserDetails] = useState({});
  const [users, setUsers] = useState([]);
  const [refreshUsers, setRefreshUsers] = useState(0);

  // Fetch users from the backend API when the component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/users"); // Replace with your backend URL
        setUsers(data); // Save fetched users in the state
      } catch (error) {
        setError("Failed to fetch users. Please try again later."); // Handle error
      }
    };

    fetchUsers(); // Call the fetch function
  }, [refreshUsers, userDetails]); // Runs when the component mounts & refresh is req

  useEffect(() => {
    if (!user) return;
    let userDetails = users.find((u) => {
      return u.user.toUpperCase().includes(user.toUpperCase());
    });

    if (!userDetails) {
      const newUser = {
        user: user,
        bookIds: [],
      };

      api
        .post("/users", newUser)
        .then(({ data }) => {
          setUserDetails(data);
          setRefreshUsers((prev) => prev + 1);
        })
        .catch((error) => {
          console.log("Failed to fetch users. Please try again later.", error); // Handle error
        });
    } else {
      setUserDetails(userDetails);
    }
  }, [user]); // Runs once when the component mounts

  /* SET UP THE PROVIDER */
  return (
    <UserContext.Provider
      value={{ user, setUser, userDetails, setUserDetails }}
    >
      {props.children}
    </UserContext.Provider>
  );
}

export { UserProviderWrapper };

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("Context must be used within a Provider");
  }
  return context;
}
