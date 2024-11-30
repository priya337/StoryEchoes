import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:400", // Base URL
});

export default instance;
