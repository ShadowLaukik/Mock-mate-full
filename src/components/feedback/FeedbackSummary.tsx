
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { mockSessions, mockFeedback } from "@/lib/mockData";
import { Link } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FeedbackSummary = () => {
  const { id } = useParams<{ id: string }>();
  const session = mockSessions.find(s => s.id === id);
  const sessionFeedback = mockFeedback.filter(f => f.sessionId === id);
  
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Session not found</h2>
        <p className="mb-4">The session you're looking for doesn't exist or has been removed.</p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const participants = session.participants.filter(p => p.role === "participant");
  
  // Generate radar chart data
  const generateChartData = (participantId: string) => {
    const feedback = sessionFeedback.find(f => f.participantId === participantId);
    
    if (!feedback) return [];
    
    return [
      { skill: "Clarity", value: feedback.clarity },
      { skill: "Content", value: feedback.content },
      { skill: "Delivery", value: feedback.delivery },
      { skill: "Engagement", value: feedback.engagement }
    ];
  };
  
  // Generate star display for a rating
  const renderStars = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">{session.title}</h1>
            <p className="text-foreground/70">{session.description}</p>
            <div className="flex items-center mt-2">
              <Badge className="mr-2 capitalize">{session.status}</Badge>
              <span className="text-sm text-foreground/70">
                {new Date(session.date).toLocaleDateString()} | {session.duration} minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={participants[0]?.id}>
        <TabsList className="mb-6">
          {participants.map(participant => (
            <TabsTrigger key={participant.id} value={participant.id}>
              {participant.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {participants.map(participant => {
          const feedback = sessionFeedback.find(f => f.participantId === participant.id);
          
          return (
            <TabsContent key={participant.id} value={participant.id} className="animate-fade-in">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column: Chart and overall stats */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>
                  
                  {feedback ? (
                    <>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={generateChartData(participant.id)}
                          >
                            <PolarGrid />
                            <PolarAngleAxis dataKey="skill" />
                            <Radar
                              name={participant.name}
                              dataKey="value"
                              stroke="#8B5CF6"
                              fill="#8B5CF6"
                              fillOpacity={0.4}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-md">
                          <p className="text-sm text-foreground/70">Overall Score</p>
                          <div className="flex items-center space-x-2">
                            {renderStars(feedback.overall)}
                            <span className="text-lg font-semibold">{feedback.overall}</span>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 p-3 rounded-md">
                          <p className="text-sm text-foreground/70">Highest Rated</p>
                          <p className="font-semibold">
                            {["clarity", "content", "delivery", "engagement"].reduce(
                              (max, current) => 
                                feedback[current as keyof typeof feedback] > 
                                feedback[max as keyof typeof feedback] ? current : max
                            )}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-foreground/70">
                      No feedback data available
                    </div>
                  )}
                </div>

                {/* Right column: Comments and detailed ratings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">Detailed Feedback</h2>
                  
                  {feedback ? (
                    <>
                      <div className="mb-6 bg-muted/30 p-4 rounded-md">
                        <h3 className="font-medium mb-2">Evaluator Comments</h3>
                        <p className="text-foreground/80 italic">"{feedback.comments}"</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Communication Clarity</span>
                            <div>{renderStars(feedback.clarity)}</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-mockmate-primary h-1.5 rounded-full"
                              style={{ width: `${(feedback.clarity / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Content Quality</span>
                            <div>{renderStars(feedback.content)}</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-mockmate-secondary h-1.5 rounded-full"
                              style={{ width: `${(feedback.content / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Delivery Style</span>
                            <div>{renderStars(feedback.delivery)}</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-mockmate-accent h-1.5 rounded-full"
                              style={{ width: `${(feedback.delivery / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Group Engagement</span>
                            <div>{renderStars(feedback.engagement)}</div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div
                              className="bg-mockmate-primary h-1.5 rounded-full"
                              style={{ width: `${(feedback.engagement / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-72 flex items-center justify-center text-foreground/70">
                      No feedback data available
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="mt-8 text-center">
        <p className="mb-4 text-foreground/70">Want to improve based on this feedback?</p>
        <Link to="/dashboard">
          <Button>Join Another Session</Button>
        </Link>
      </div>
    </div>
  );
};

export default FeedbackSummary;
