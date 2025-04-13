
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar, Clock, Users } from "lucide-react";
import { mockDataManager, Session } from "@/lib/mockData";
import SessionCard from "@/components/dashboard/SessionCard";
import CreateSessionModal from "@/components/dashboard/CreateSessionModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ModeratorDashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Initial load of all sessions
    setSessions(mockDataManager.getAllSessions());
    
    // Set up polling to simulate real-time updates
    const interval = setInterval(() => {
      const updatedSessions = mockDataManager.getAllSessions();
      if (JSON.stringify(updatedSessions) !== JSON.stringify(sessions)) {
        setSessions(updatedSessions);
        console.log("Moderator dashboard sessions updated:", updatedSessions);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [sessions]);

  // Filter sessions for the current moderator
  const myUpcomingSessions = sessions
    .filter(session => session.moderatorId === user?.id || session.moderatorId === "user-1")
    .filter(session => session.status === "upcoming")
    .slice(0, 3);

  const myActiveSessions = sessions
    .filter(session => session.moderatorId === user?.id || session.moderatorId === "user-1")
    .filter(session => session.status === "active")
    .slice(0, 1);

  const myCompletedSessions = sessions
    .filter(session => session.moderatorId === user?.id || session.moderatorId === "user-1")
    .filter(session => session.status === "completed")
    .slice(0, 2);

  const stats = [
    {
      icon: <Calendar className="h-8 w-8 text-mockmate-primary" />,
      title: "Total Sessions",
      value: "12",
    },
    {
      icon: <Clock className="h-8 w-8 text-mockmate-secondary" />,
      title: "Hours Moderated",
      value: "24",
    },
    {
      icon: <Users className="h-8 w-8 text-mockmate-accent" />,
      title: "Participants Engaged",
      value: "48",
    },
  ];

  const handleSessionUpdate = (updatedSession: Session) => {
    // Update the session in the data manager
    const success = mockDataManager.updateSession(updatedSession);
    
    if (success) {
      // Update local state to reflect the changes
      setSessions(mockDataManager.getAllSessions());
      
      toast({
        title: "Session updated",
        description: "Session details have been successfully updated.",
      });
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSessionCreate = (newSession: Session) => {
    // Add the new session to the data manager
    const createdSession = mockDataManager.createSession({
      title: newSession.title,
      description: newSession.description,
      status: newSession.status,
      date: newSession.date,
      duration: newSession.duration,
      participants: newSession.participants,
      moderatorId: user?.id || "user-1",
      evaluatorIds: newSession.evaluatorIds
    });
    
    console.log("Created new session:", createdSession);
    
    // Update the local state with all sessions including the new one
    setSessions(mockDataManager.getAllSessions());
    setIsCreateModalOpen(false);
    
    toast({
      title: "Session created",
      description: "Your new discussion session has been created.",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
          <p className="text-foreground/70">Manage your discussion sessions and track progress</p>
        </div>
        <Button className="btn-effect" onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Session
        </Button>
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
              <SessionCard 
                key={session.id} 
                session={session} 
                role="moderator"
                onSessionUpdate={handleSessionUpdate}
              />
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
              <SessionCard 
                key={session.id} 
                session={session} 
                role="moderator"
                onSessionUpdate={handleSessionUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No upcoming sessions</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create your first session
            </Button>
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Past Sessions</h2>
        {myCompletedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCompletedSessions.map(session => (
              <SessionCard 
                key={session.id} 
                session={session} 
                role="moderator"
                onSessionUpdate={handleSessionUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No completed sessions yet</p>
          </div>
        )}
      </div>

      <CreateSessionModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSession={handleSessionCreate}
      />
    </div>
  );
};

export default ModeratorDashboard;
