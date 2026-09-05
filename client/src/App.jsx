import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WorkflowCanvas from './pages/WorkflowCanvas'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/workflow/:projectId?" element={<WorkflowCanvas />} />
      </Routes>
    </Router>
  )
}

export default App
