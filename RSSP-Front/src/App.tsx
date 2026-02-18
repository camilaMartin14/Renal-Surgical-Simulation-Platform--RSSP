import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Results from './pages/Results'
import Login from './pages/Login'
import Register from './pages/Register'
import LinePrecision from './pages/LinePrecision'
import Reflex from './pages/Reflex'
import TumorAblation from './pages/TumorAblation'
import Suture from './pages/Suture'
import SteadyHand from './pages/SteadyHand'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/results" element={<Layout><Results /></Layout>} />
      
      <Route path="/line-precision" element={<Layout><LinePrecision /></Layout>} />
      <Route path="/reflex" element={<Layout><Reflex /></Layout>} />
      <Route path="/tumor-ablation" element={<Layout><TumorAblation /></Layout>} />
      <Route path="/suture" element={<Layout><Suture /></Layout>} />
      <Route path="/steady-hand" element={<Layout><SteadyHand /></Layout>} />
    </Routes>
  )
}
