import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme';
import Splash from './pages/Splash';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import Volunteers from './pages/Volunteers';
import VolunteerProfile from './pages/VolunteerProfile';
import VolunteerReport from './pages/VolunteerReport';
import Programs from './pages/Programs';
import ProgramProfile from './pages/ProgramProfile';
import Sponsors from './pages/Sponsors';
import SponsorProfile from './pages/SponsorProfile';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/volunteers/:id" element={<VolunteerProfile />} />
          <Route path="/volunteers/:id/profile" element={<VolunteerReport />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:id" element={<ProgramProfile />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/sponsors/:id" element={<SponsorProfile />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
