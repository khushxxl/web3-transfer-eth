import './App.css'
import Welcome from './components/Welcome'
import Transactions from './components/Transactions'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Services from './components/Services'

function App() {
  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <Navbar />
        <Welcome />
      </div>
      <Services />
      <Transactions />
      <Footer />
    </div>
  )
}

export default App
