
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ModeratorDashboard from "@/components/dashboard/ModeratorDashboard";
import ParticipantDashboard from "@/components/dashboard/ParticipantDashboard";
import EvaluatorDashboard from "@/components/dashboard/EvaluatorDashboard";
import { mockDataManager } from "@/lib/mockData";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      navigate('/');
    } else if (!loading) {
      setIsLoading(false);
    }

    // Initialize data listeners for real-time updates
    const dataRefreshInterval = setInterval(() => {
      // This will trigger any listeners for session updates
      mockDataManager.notifyListeners();
    }, 5000);

    return () => clearInterval(dataRefreshInterval);
  }, [user, loading, navigate]);

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case "moderator":
        return <ModeratorDashboard />;
      case "participant":
        return <ParticipantDashboard />;
      case "evaluator":
        return <EvaluatorDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-mockmate-primary font-bold text-xl">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {renderDashboard()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
