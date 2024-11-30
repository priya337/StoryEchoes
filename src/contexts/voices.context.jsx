import { createContext, useState, useEffect } from "react";

const VoicesContext = createContext();

// CREATE A WRAPPER COMPONENT
function VoicesProviderWrapper(props) {
  const [voices, setVoices] = useState([]);

  function populateVoiceList() {
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    let fetchedVoices = speechSynthesis
      .getVoices()
      .filter((voice) => voice.name.toUpperCase().includes("FEMALE"));
    setVoices(fetchedVoices);
  }

  useEffect(() => {
    populateVoiceList();

    // Attach an event listener for voiceschanged
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.addEventListener("voiceschanged", populateVoiceList);
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.removeEventListener("voiceschanged", populateVoiceList);
      }
    };
  }, []);

  /* SET UP THE PROVIDER */
  return (
    <VoicesContext.Provider value={voices}>
      {props.children}
    </VoicesContext.Provider>
  );
}

export { VoicesContext, VoicesProviderWrapper };
