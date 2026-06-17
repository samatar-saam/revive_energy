import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from './component/Navbar'
import Home from './component/Home'
import Marketplace from './component/Marketplace'
import Solutions from './component/Solutions'
import OrganicWasteSolution from './component/OrganicWasteSolution'
import AgriculturalWasteSolution from './component/AgriculturalWasteSolution'
import IndustrialWasteSolution from './component/IndustrialWasteSolution'
import PlasticRecyclingSolution from './component/PlasticRecyclingSolution'
import Impact from './component/Impact'
import HowItWorks from './component/HowItWorks'
import About from './component/About'
import Resources from './component/Resources'
import Partners from './component/Partners'
import Contact from './component/Contact'
import Login from './component/Login'
import Signup from './component/Signup'
import WelcomeSplash from './component/WelcomeSplash'

// Admin Layout
import AdminDashboard from './admin/layout/AdminDashboard'

// Admin Pages
import WasteSources from './admin/pages/WasteSources'
import WasteListings from './admin/pages/WasteListings'
import ProcessingPlants from './admin/pages/ProcessingPlants'
import Transporters from './admin/pages/Transporters'
import WasteCollections from './admin/pages/WasteCollections'
import Users from './admin/pages/Users'
import Companies from './admin/pages/Companies'
import Payments from './admin/pages/Payments'
import Analytics from './admin/pages/Analytics'
import AdminImpactReports from './admin/pages/AdminImpactReports'
import CarbonCredits from './admin/pages/CarbonCredits'
import Reviews from './admin/pages/Reviews'
import Support from './admin/pages/Support'
import AdminMessages from './admin/pages/Messages'
import Settings from './admin/pages/Settings'

// User Layout
import UserDashboard from './users/layout/UserDashboard'

// User Pages
import DashboardOverview from './users/pages/DashboardOverview'
import RequestPickup from './users/pages/RequestPickup'
import ReportWaste from './users/pages/ReportWaste'
import MyCollections from './users/pages/MyCollections'
import WasteHistory from './users/pages/WasteHistory'
import ImpactReports from './users/pages/ImpactReports'
import PaymentsInvoices from './users/pages/PaymentsInvoices'
import ProfileSettings from './users/pages/ProfileSettings'
import CustomerSupport from './users/pages/CustomerSupport'
import Messages from './users/pages/Messages'

function App() {
  const [showSplash, setShowSplash] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasChecked = useRef(false)

  useEffect(() => {
    // Prevent double execution in StrictMode
    if (hasChecked.current) {
      return
    }
    hasChecked.current = true

    // Check if splash has been shown in this session
    const splashShown = sessionStorage.getItem('revive_splash_shown')
    
    console.log('🔍 Checking splash status:', {
      splashShown,
      sessionStorage: sessionStorage.getItem('revive_splash_shown')
    })
    
    if (splashShown === 'true') {
      // Already seen splash - go directly to app
      console.log('✅ Splash already shown, skipping...')
      setShowSplash(false)
    } else {
      // First time - show splash
      console.log('🌟 First visit - showing splash screen')
      setShowSplash(true)
      sessionStorage.setItem('revive_splash_shown', 'true')
    }
    
    setIsLoading(false)
  }, [])

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F6F8F4]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#5A7060] text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Show splash screen on first visit
  if (showSplash) {
    return <WelcomeSplash onFinish={() => setShowSplash(false)} />
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/marketplace" element={<><Navbar /><Marketplace /></>} />
        <Route path="/how-it-works" element={<><Navbar /><HowItWorks /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/resources" element={<><Navbar /><Resources /></>} />
        <Route path="/partners" element={<><Navbar /><Partners /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />
        <Route path="/solutions" element={<><Navbar /><Solutions /></>} />
        <Route path="/solutions/organic-waste" element={<><Navbar /><OrganicWasteSolution /></>} />
        <Route path="/solutions/agricultural-waste" element={<><Navbar /><AgriculturalWasteSolution /></>} />
        <Route path="/solutions/industrial-waste" element={<><Navbar /><IndustrialWasteSolution /></>} />
        <Route path="/solutions/plastic-recycling" element={<><Navbar /><PlasticRecyclingSolution /></>} />
        <Route path="/impact" element={<><Navbar /><Impact /></>} />
        
        {/* ============ ADMIN DASHBOARD ROUTES ============ */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<WasteSources />} />
          <Route path="waste-sources" element={<WasteSources />} />
          <Route path="waste-listings" element={<WasteListings />} />
          <Route path="processing-plants" element={<ProcessingPlants />} />
          <Route path="transporters" element={<Transporters />} />
          <Route path="collections" element={<WasteCollections />} />
          <Route path="users" element={<Users />} />
          <Route path="companies" element={<Companies />} />
          <Route path="payments" element={<Payments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="impact-reports" element={<AdminImpactReports />} />
          <Route path="carbon-credits" element={<CarbonCredits />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="support" element={<Support />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ============ USER DASHBOARD ROUTES ============ */}
        <Route path="/dashboard" element={<UserDashboard />}>
          <Route index element={<DashboardOverview />} />
          <Route path="request-pickup" element={<RequestPickup />} />
          <Route path="report-waste" element={<ReportWaste />} />
          <Route path="collections" element={<MyCollections />} />
          <Route path="history" element={<WasteHistory />} />
          <Route path="impact" element={<ImpactReports />} />
          <Route path="payments" element={<PaymentsInvoices />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="support" element={<CustomerSupport />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App