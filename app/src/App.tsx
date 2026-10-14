import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Audio from "./pages/Audio";
import Hadith from "./pages/Hadith";
import Zikr from "./pages/Zikr";
import Names from "./pages/Names";
import Qibla from "./pages/Qibla";
import { AudioProvider } from "./context/AudioContext";

function App() {
  return (
    <AudioProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/qibla" element={<Qibla />} />
          <Route path="/hadith" element={<Hadith />} />
          <Route path="/zikr" element={<Zikr />} />
          <Route path="/names" element={<Names />} />
        </Routes>
      </Layout>
    </AudioProvider>
  );
}

export default App;
