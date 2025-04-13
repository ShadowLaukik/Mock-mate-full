
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeatureSection from "@/components/landing/FeatureSection";
import RoleSection from "@/components/landing/RoleSection";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Handle hash-based navigation
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash]);
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <div id="home">
          <HeroSection />
        </div>
        <div id="features">
          <FeatureSection />
        </div>
        <div id="roles">
          <RoleSection />
        </div>
        
        {/* Footer */}
        <footer className="bg-mockmate-dark text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">MockMate</h2>
            <p className="text-white/70 mb-6">Improve your group discussion and interview skills</p>
            <div className="flex justify-center space-x-6 mb-6">
              <Link to="/#home" className="text-white/70 hover:text-white">Home</Link>
              <Link to="/#features" className="text-white/70 hover:text-white">Features</Link>
              <Link to="/#roles" className="text-white/70 hover:text-white">Roles</Link>
            </div>
            <p className="text-sm text-white/50">© 2025 MockMate. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
