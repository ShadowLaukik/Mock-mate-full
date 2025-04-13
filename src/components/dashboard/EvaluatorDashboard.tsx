
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileCheck, Users } from "lucide-react";
import { mockSessions, mockFeedback } from "@/lib/mockData";
import SessionCard from "@/components/dashboard/SessionCard";
import { useAuth } from "@/context/AuthContext";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Participant } from "@/lib/mockData";

const EvaluatorDashboard = () => {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { user } = useAuth();

  // Filter sessions where user is an evaluator
  const myUpcomingSessions = mockSessions
    .filter(session => session.evaluatorIds.includes(user?.id || "user-5") || 
                      session.participants.some(p => p.id === user?.id && p.role === "evaluator"))
    .filter(session => session.status === "upcoming")
    .slice(0, 3);

  const myActiveSessions = mockSessions
    .filter(session => session.evaluatorIds.includes(user?.id || "user-5") || 
                      session.participants.some(p => p.id === user?.id && p.role === "evaluator"))
    .filter(session => session.status === "active")
    .slice(0, 2);

  const myCompletedSessions = mockSessions
    .filter(session => session.evaluatorIds.includes(user?.id || "user-5") || 
                      session.participants.some(p => p.id === user?.id && p.role === "evaluator"))
    .filter(session => session.status === "completed")
    .slice(0, 2);

  // Get active session participants (only participants, not moderators or evaluators)
  const getSessionParticipants = (sessionId: string) => {
    const session = mockSessions.find(s => s.id === sessionId);
    return session?.participants.filter(p => p.role === "participant") || [];
  };

  const handleEvaluateClick = (sessionId: string, participant: Participant) => {
    setSelectedSession(sessionId);
    setSelectedParticipant(participant);
    setFeedbackModalOpen(true);
  };

  const stats = [
    {
      icon: <ClipboardCheck className="h-8 w-8 text-mockmate-primary" />,
      title: "Sessions Evaluated",
      value: "15",
    },
    {
      icon: <Users className="h-8 w-8 text-mockmate-secondary" />,
      title: "Participants Rated",
      value: "42",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-mockmate-accent" />,
      title: "Feedbacks Given",
      value: mockFeedback.length.toString(),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Evaluator Dashboard</h1>
        <p className="text-foreground/70">Evaluate discussion sessions and provide constructive feedback</p>
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

      {/* Active Sessions to Evaluate */}
      {myActiveSessions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Active Sessions to Evaluate</h2>
          <Tabs defaultValue={myActiveSessions[0]?.id}>
            <TabsList className="mb-4">
              {myActiveSessions.map(session => (
                <TabsTrigger key={session.id} value={session.id}>
                  {session.title}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {myActiveSessions.map(session => (
              <TabsContent key={session.id} value={session.id}>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{session.title}</h3>
                        <p className="text-sm text-foreground/70">{session.description}</p>
                      </div>
                      <Badge className="bg-green-500">Live Now</Badge>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium">Participants to Evaluate:</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {getSessionParticipants(session.id).map(participant => (
                      <div key={participant.id} className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-mockmate-primary/20 flex items-center justify-center text-mockmate-primary font-bold">
                            {participant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-foreground/70">{participant.email}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleEvaluateClick(session.id, participant)}
                        >
                          Evaluate
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button variant="outline">View Discussion Room</Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}

      {/* Upcoming Sessions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upcoming Sessions</h2>
        {myUpcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myUpcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} role="evaluator" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No upcoming sessions to evaluate</p>
          </div>
        )}
      </div>

      {/* Completed Evaluations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Completed Evaluations</h2>
        {myCompletedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCompletedSessions.map(session => (
              <SessionCard key={session.id} session={session} role="evaluator" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-foreground/70">No completed evaluations yet</p>
          </div>
        )}
      </div>

      {/* Recent Feedback Given */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Feedback Given</h2>
        <div className="space-y-4">
          {mockFeedback.slice(0, 2).map((feedback) => {
            const session = mockSessions.find(s => s.id === feedback.sessionId);
            const participant = session?.participants.find(p => p.id === feedback.participantId);
            
            return (
              <div key={feedback.id} className="bg-muted/30 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">{participant?.name}</div>
                  <div className="text-sm text-foreground/70">{session?.title}</div>
                </div>
                <div className="text-sm mb-2">{feedback.comments}</div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-mockmate-primary">Overall Score: {feedback.overall}/5</div>
                  <div className="text-foreground/60">{new Date(feedback.timestamp).toLocaleDateString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {feedbackModalOpen && selectedParticipant && selectedSession && (
        <FeedbackForm
          isOpen={feedbackModalOpen}
          onClose={() => setFeedbackModalOpen(false)}
          participant={selectedParticipant}
          sessionId={selectedSession}
        />
      )}
    </div>
  );
};

export default EvaluatorDashboard;
