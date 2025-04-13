
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Award, TrendingUp, Video } from "lucide-react";
import { mockDataManager, Session } from "@/lib/mockData";
import SessionCard from "@/components/dashboard/SessionCard";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const { toast } = useToast();
  
  // Create a session update handler that we can both add and remove as a listener
  const handleSessionsUpdate = useCallback((updatedSessions: Session[]) => {
    // Check if there are new sessions compared to previous state
    if (updatedSessions.length > sessions.length) {
      toast({
        title: "New session available",
        description: "A new discussion session has been added.",
      });
    }
    
    setSessions(updatedSessions);
  }, [sessions.length, toast]);

  useEffect(() => {
    // Initial load
    const initialSessions = mockDataManager.getAllSessions();
    setSessions(initialSessions);
    
    // Set up a session data update listener
    mockDataManager.addListener(handleSessionsUpdate);
    
    // Clean up listener on component unmount
    return () => {
      mockDataManager.removeListener(handleSessionsUpdate);
    };
  }, [handleSessionsUpdate]);

  // Filter sessions to show ones the participant is part of,
  // or all sessions if the user is a participant
  const myUpcomingSessions = sessions
    .filter(session => session.status === "upcoming")
    .slice(0, 3);

  const myActiveSessions = sessions
    .filter(session => session.status === "active")
    .slice(0, 1);

  const myCompletedSessions = sessions
    .filter(session => session.status === "completed")
    .slice(0, 2);

  const stats = [
    {
      icon: <Calendar className="h-8 w-8 text-mockmate-primary" />,
      title: "Sessions Joined",
      value: "8",
    },
    {
      icon: <Award className="h-8 w-8 text-mockmate-secondary" />,
      title: "Average Rating",
      value: "4.2/5",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-mockmate-accent" />,
      title: "Skills Improved",
      value: "Communication",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Participant Dashboard</h1>
        <p className="text-foreground/70">Track your discussion sessions and progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="bg-muted rounded-full p-3">{stat.icon}</div>
              <div>
                <p className="text-foreground/70">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Sessions */}
      {myActiveSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Active Sessions</h2>
          <div className="grid grid-cols-1 gap-4">
            {myActiveSessions.map(session => (
              <div key={session.id} className="relative">
                <SessionCard session={session} role="participant" />
                <div className="absolute top-4 right-4">
                  <Link to={`/camera/${session.id}`}>
                    <Button className="bg-mockmate-primary hover:bg-mockmate-primary/90 flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Join Video Chat
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
        {myUpcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myUpcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} role="participant" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No upcoming sessions</p>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Past Sessions</h2>
        {myCompletedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCompletedSessions.map(session => (
              <SessionCard key={session.id} session={session} role="participant" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No completed sessions yet</p>
          </div>
        )}
      </div>

      {/* Feedback & Improvement */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Communication Clarity</span>
              <span className="font-medium">70%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-mockmate-primary h-2.5 rounded-full" style={{ width: "70%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Critical Thinking</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-mockmate-secondary h-2.5 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Participation</span>
              <span className="font-medium">60%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-mockmate-accent h-2.5 rounded-full" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Link to="/feedback">
            <Button variant="outline" className="w-full">View Detailed Feedback</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
