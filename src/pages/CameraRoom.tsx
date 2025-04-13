import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  MessageSquare, 
  Share2,
  ScreenShare,
  ScreenShareOff,
  HandMetal,
  Settings
} from "lucide-react";
import { mockSessions, mockDataManager } from "@/lib/mockData";
import { Badge } from "@/components/ui/badge";
import { Participant } from "@/lib/mockData";

const CameraRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(mockSessions.find(s => s.id === id));
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session ? session.duration * 60 : 0);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, text: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [activeParticipants, setActiveParticipants] = useState<Participant[]>([]);
  const [videoGridColumns, setVideoGridColumns] = useState("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const [localMediaStream, setLocalMediaStream] = useState<MediaStream | null>(null);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const participantCount = activeParticipants.length + 1; // +1 for current user
    if (participantCount <= 2) {
      setVideoGridColumns("grid-cols-1 sm:grid-cols-1");
    } else if (participantCount <= 4) {
      setVideoGridColumns("grid-cols-1 sm:grid-cols-2");
    } else if (participantCount <= 9) {
      setVideoGridColumns("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3");
    } else {
      setVideoGridColumns("grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4");
    }
  }, [activeParticipants]);

  useEffect(() => {
    if (!session) {
      toast({
        title: "Session not found",
        description: "The discussion room you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }

    const sessionRefreshInterval = setInterval(() => {
      const updatedSession = mockDataManager.getSessionById(id || "");
      if (updatedSession && JSON.stringify(updatedSession) !== JSON.stringify(session)) {
        setSession(updatedSession);
        
        if (updatedSession.participants) {
          setActiveParticipants(
            updatedSession.participants.map(p => ({
              ...p,
              isActive: Math.random() > 0.3,
              isSpeaking: false,
              hasCamera: Math.random() > 0.5,
              hasMic: Math.random() > 0.3,
            }))
          );
        }
      }
    }, 3000);

    if (session) {
      setActiveParticipants(
        session.participants.map(p => ({
          ...p,
          isActive: Math.random() > 0.3,
          isSpeaking: false,
          hasCamera: Math.random() > 0.5,
          hasMic: Math.random() > 0.3,
        }))
      );
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          toast({
            title: "Time's up!",
            description: "The discussion session has ended."
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const chatInterval = setInterval(() => {
      if (session && Math.random() > 0.7) {
        const randomParticipant = session.participants[
          Math.floor(Math.random() * session.participants.length)
        ];
        
        if (randomParticipant.id !== user?.id) {
          const messages = [
            "I think we should consider the alternative approach here.",
            "That's an interesting point. Let me add to that.",
            "Could you elaborate more on that idea?",
            "I agree with what was said earlier about the main topic.",
            "From my perspective, there are a few key considerations.",
            "Has anyone thought about the implications for stakeholders?",
            "I'd like to hear more views on this aspect of the discussion."
          ];
          
          setChatMessages(prev => [
            ...prev, 
            {
              sender: randomParticipant.name,
              text: messages[Math.floor(Math.random() * messages.length)],
              timestamp: new Date()
            }
          ]);

          setActiveParticipants(prev => 
            prev.map(p => ({
              ...p,
              isSpeaking: p.id === randomParticipant.id ? true : p.isSpeaking
            }))
          );
          
          setTimeout(() => {
            setActiveParticipants(prev => 
              prev.map(p => ({
                ...p,
                isSpeaking: p.id === randomParticipant.id ? false : p.isSpeaking
              }))
            );
          }, 2000);
        }
      }
    }, 8000);

    const activityInterval = setInterval(() => {
      setActiveParticipants(prev => 
        prev.map(p => ({
          ...p,
          isActive: Math.random() > 0.2,
        }))
      );
    }, 15000);

    return () => {
      clearInterval(timer);
      clearInterval(chatInterval);
      clearInterval(activityInterval);
      clearInterval(sessionRefreshInterval);
      
      if (localMediaStream) {
        localMediaStream.getTracks().forEach(track => track.stop());
      }
      if (screenShareStream) {
        screenShareStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, navigate, toast, user?.id, session]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (isVideoEnabled && localVideoRef.current && !localVideoRef.current.srcObject) {
      toggleVideo();
    }
  }, [isVideoEnabled]);

  useEffect(() => {
    if (isScreenSharing && screenShareRef.current && !screenShareRef.current.srcObject) {
      toggleScreenShare();
    }
  }, [isScreenSharing]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = async () => {
    try {
      if (isMicEnabled) {
        if (localMediaStream) {
          localMediaStream.getAudioTracks().forEach(track => {
            track.enabled = false;
            track.stop();
          });
          
          if (isVideoEnabled && localMediaStream.getVideoTracks().length > 0) {
            const videoTracks = localMediaStream.getVideoTracks();
            const newStream = new MediaStream();
            videoTracks.forEach(track => newStream.addTrack(track));
            setLocalMediaStream(newStream);
            
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = newStream;
            }
          } else {
            setLocalMediaStream(null);
          }
        }
        
        setIsMicEnabled(false);
        toast({
          title: "Microphone disabled",
          duration: 2000
        });
      } else {
        try {
          let newStream;
          
          if (localMediaStream && isVideoEnabled) {
            newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioTrack = newStream.getAudioTracks()[0];
            
            if (localMediaStream.getAudioTracks().length === 0) {
              localMediaStream.addTrack(audioTrack);
            }
            newStream = localMediaStream;
          } else {
            newStream = await navigator.mediaDevices.getUserMedia({ 
              audio: true,
              video: isVideoEnabled
            });
            setLocalMediaStream(newStream);
          }
          
          if (localVideoRef.current && isVideoEnabled) {
            localVideoRef.current.srcObject = newStream;
          }
          
          setIsMicEnabled(true);
          toast({
            title: "Microphone enabled",
            duration: 2000
          });
        } catch (error) {
          console.error("Error accessing microphone:", error);
          toast({
            variant: "destructive",
            title: "Microphone access denied",
            description: "Please allow microphone access in your browser settings."
          });
        }
      }
    } catch (error) {
      console.error("Error toggling microphone:", error);
      toast({
        variant: "destructive",
        title: "Microphone error",
        description: "An error occurred while toggling the microphone."
      });
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoEnabled) {
        if (localMediaStream) {
          localMediaStream.getVideoTracks().forEach(track => {
            track.enabled = false;
            track.stop();
          });
          
          if (isMicEnabled && localMediaStream.getAudioTracks().length > 0) {
            const audioTracks = localMediaStream.getAudioTracks();
            const newStream = new MediaStream();
            audioTracks.forEach(track => newStream.addTrack(track));
            setLocalMediaStream(newStream);
          } else {
            setLocalMediaStream(null);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = null;
            }
          }
        }
        
        setIsVideoEnabled(false);
        toast({
          title: "Camera disabled",
          duration: 2000
        });
      } else {
        try {
          const constraints = {
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: isMicEnabled
          };
          
          let newStream = await navigator.mediaDevices.getUserMedia(constraints);
          
          if (isMicEnabled && localMediaStream) {
            const audioTracks = localMediaStream.getAudioTracks();
            audioTracks.forEach(track => newStream.addTrack(track.clone()));
          }
          
          setLocalMediaStream(newStream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
          }
          
          setIsVideoEnabled(true);
          toast({
            title: "Camera enabled",
            duration: 2000
          });
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast({
            variant: "destructive",
            title: "Camera access denied",
            description: "Please check your browser permissions."
          });
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      toast({
        variant: "destructive",
        title: "Camera error",
        description: "An error occurred while toggling the camera."
      });
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing && screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
      setScreenShareStream(null);
      setIsScreenSharing(false);
      
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
      
      toast({
        title: "Screen sharing stopped",
        duration: 2000
      });
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true 
        });
        
        setScreenShareStream(stream);
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
          screenShareRef.current.onloadedmetadata = () => {
            if (screenShareRef.current) {
              screenShareRef.current.play().catch(e => {
                console.error("Error playing screen share video:", e);
              });
            }
          };
        }
        
        setIsScreenSharing(true);
        
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenShareStream(null);
          
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null;
          }
          
          toast({
            title: "Screen sharing stopped",
            duration: 2000
          });
        };
        
        toast({
          title: "Screen sharing started",
          duration: 2000
        });
      } catch (error) {
        console.error("Error sharing screen:", error);
        toast({
          variant: "destructive",
          title: "Screen sharing failed",
          description: "Unable to share your screen."
        });
      }
    }
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    
    toast({
      title: !isHandRaised ? "Hand raised" : "Hand lowered",
      duration: 2000
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsParticipantsOpen(false);
    }
  };

  const toggleParticipants = () => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (!isParticipantsOpen) {
      setIsChatOpen(false);
    }
  };

  const shareRoom = () => {
    const roomLink = window.location.href;
    navigator.clipboard.writeText(roomLink).then(
      () => {
        toast({
          title: "Link copied!",
          description: "Room link copied to clipboard"
        });
      },
      (err) => {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy the room link"
        });
      }
    );
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim()) {
      setChatMessages(prev => [
        ...prev, 
        {
          sender: user?.name || "You",
          text: newMessage.trim(),
          timestamp: new Date()
        }
      ]);
      setNewMessage("");
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                className="text-white mr-4" 
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h2 className="font-medium truncate max-w-[200px] md:max-w-md">{session.title}</h2>
                <p className="text-xs text-gray-400 truncate max-w-[200px] md:max-w-md">{session.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-gray-700 px-3 py-1 rounded-full flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${timeLeft > 60 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pt-16 pb-20">
        <div className="flex flex-col md:flex-row h-[calc(100vh-130px)] mt-2">
          <div ref={videoContainerRef} className={`flex-1 bg-gray-800 rounded-lg overflow-hidden ${(isChatOpen || isParticipantsOpen) ? 'md:mr-4' : ''}`}>
            <div className={`grid ${videoGridColumns} gap-4 p-4 h-full`}>
              {isScreenSharing && (
                <div className="col-span-full row-span-2 relative bg-gray-700 rounded-lg overflow-hidden">
                  <video 
                    ref={screenShareRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-2 left-2 text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
                    <ScreenShare className="h-3 w-3 mr-1" />
                    {user?.name || 'You'}'s screen
                  </div>
                </div>
              )}
              
              <div className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
                {isVideoEnabled ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                    <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                      {user?.name?.charAt(0) || '?'}
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
                    {user?.name || 'You'}
                  </span>
                  <div className="flex space-x-1">
                    {!isMicEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                    {isHandRaised && <HandMetal className="h-4 w-4 text-yellow-400" />}
                  </div>
                </div>
              </div>

              {activeParticipants
                .filter(p => p.id !== user?.id)
                .map((participant) => (
                  <div key={participant.id} className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
                    {participant.hasCamera ? (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <div className={`w-full h-full flex items-center justify-center ${participant.isSpeaking ? 'border-2 border-green-500' : ''}`}>
                          {Math.random() > 0.7 ? (
                            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                              {participant.name.charAt(0)}
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                                {participant.name.charAt(0)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                        <div className={`w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold ${participant.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
                          {participant.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-sm bg-black bg-opacity-50 px-2 py-1 rounded flex items-center">
                        {participant.name}
                      </span>
                      <div className="flex space-x-1"> 
                        {!participant.hasMic && <MicOff className="h-4 w-4 text-red-500" />}
                        {Math.random() > 0.9 && <HandMetal className="h-4 w-4 text-yellow-400" />}
                        <div className={`ml-1 w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    </div>
                    {participant.isSpeaking && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500 animate-pulse">Speaking</Badge>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {isChatOpen && (
            <div className="w-full md:w-80 bg-gray-800 rounded-lg mt-4 md:mt-0 flex flex-col animate-fade-in">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Chat</h3>
                <Button variant="ghost" size="sm" onClick={toggleChat}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div 
                className="flex-1 overflow-y-auto p-3"
                ref={chatContainerRef}
              >
                <div className="space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.sender === (user?.name || "You") ? "items-end" : "items-start"}`}>
                      <div className="text-xs text-gray-400">{msg.sender}</div>
                      <div className={`rounded-lg p-2 max-w-[90%] ${
                        msg.sender === (user?.name || "You") 
                          ? "bg-blue-600" 
                          : "bg-gray-700"
                      }`}>
                        {msg.text}
                      </div>
                      <div className="text-xs text-gray-400">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 border-t border-gray-700">
                <form onSubmit={sendMessage} className="flex">
                  <Input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-gray-700 border-0 rounded-l-lg px-3 py-2 text-sm focus:ring-0 focus:outline-none text-white" 
                    placeholder="Type a message..." 
                  />
                  <Button type="submit" className="rounded-l-none">Send</Button>
                </form>
              </div>
            </div>
          )}

          {isParticipantsOpen && (
            <div className="w-full md:w-80 bg-gray-800 rounded-lg mt-4 md:mt-0 flex flex-col animate-fade-in">
              <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-medium">Participants ({activeParticipants.length})</h3>
                <Button variant="ghost" size="sm" onClick={toggleParticipants}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          {user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border border-gray-800"></div>
                      </div>
                      <div>
                        <div className="text-sm">{user?.name || "You"} (You)</div>
                        <div className="text-xs text-gray-400">{user?.role || "Participant"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {isMicEnabled ? 
                        <Mic className="h-3 w-3 text-gray-400" /> : 
                        <MicOff className="h-3 w-3 text-gray-400" />
                      }
                      {isVideoEnabled ? 
                        <Video className="h-3 w-3 text-gray-400 ml-1" /> : 
                        <VideoOff className="h-3 w-3 text-gray-400 ml-1" />
                      }
                      {isHandRaised && 
                        <HandMetal className="h-3 w-3 text-yellow-400 ml-1" />
                      }
                    </div>
                  </div>
                  
                  {activeParticipants
                    .filter(p => p.id !== user?.id)
                    .map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center ${participant.isSpeaking ? 'ring-2 ring-green-500' : ''}`}>
                              {participant.name.charAt(0)}
                            </div>
                            <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-500' : 'bg-gray-400'} border border-gray-800`}></div>
                          </div>
                          <div>
                            <div className="text-sm flex items-center">
                              {participant.name}
                              {participant.isSpeaking && <Badge className="ml-2 py-0 h-4 bg-green-500">Speaking</Badge>}
                            </div>
                            <div className="text-xs text-gray-400">{participant.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {participant.hasMic ? 
                            <Mic className="h-3 w-3 text-gray-400" /> : 
                            <MicOff className="h-3 w-3 text-gray-400" />
                          }
                          {participant.hasCamera ? 
                            <Video className="h-3 w-3 text-gray-400 ml-1" /> : 
                            <VideoOff className="h-3 w-3 text-gray-400 ml-1" />
                          }
                          {Math.random() > 0.9 && 
                            <HandMetal className="h-3 w-3 text-yellow-400 ml-1" />
                          }
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 py-4 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            <Button 
              onClick={toggleMic}
              variant={isMicEnabled ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              {isMicEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={toggleVideo}
              variant={isVideoEnabled ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={toggleScreenShare}
              variant={isScreenSharing ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
            </Button>
            <Button 
              onClick={toggleHandRaise}
              variant={isHandRaised ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <HandMetal className="h-5 w-5" />
            </Button>
            <Button 
              onClick={toggleChat}
              variant={isChatOpen ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button 
              onClick={toggleParticipants}
              variant={isParticipantsOpen ? "default" : "outline"}
              size="icon"
              className="rounded-full h-12 w-12"
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12"
              onClick={shareRoom}
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="destructive"
              className="rounded-full px-5"
              onClick={() => navigate("/dashboard")}
            >
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraRoom;
