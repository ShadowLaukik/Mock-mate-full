import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate } from "react-router-dom";
import { mockSessions, mockMessages, Message, Participant } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Send, Clock, ArrowLeft, Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, Share2, Users, HandMetal, MessageSquare } from "lucide-react";

const DiscussionRoom = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const [session, setSession] = useState(mockSessions.find(s => s.id === id));
  const [messages, setMessages] = useState<Message[]>(mockMessages[id || ""] || []);
  const [newMessage, setNewMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(session ? session.duration * 60 : 0);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>(
    session?.participants.map(p => ({ ...p, isActive: Math.random() > 0.5 })) || []
  );
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (!session) {
      toast({
        title: "Session not found",
        description: "The discussion session you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
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

    const typingInterval = setInterval(() => {
      const randomParticipant = participants.find(p => p.role === "participant" && p.id !== user?.id);
      if (randomParticipant && Math.random() > 0.7) {
        setTypingUsers(prev => [...prev, randomParticipant.name]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(name => name !== randomParticipant.name));
        }, 3000);
      }
    }, 5000);

    const messageInterval = setInterval(() => {
      const randomParticipant = participants.find(p => p.role === "participant" && p.id !== user?.id);
      if (randomParticipant && Math.random() > 0.8) {
        const randomMessages = [
          "I think we should consider the long-term implications of this approach.",
          "Has anyone considered the impact on smaller businesses?",
          "From my research, the trends suggest a different outcome.",
          "I'd like to add another perspective to what was just discussed.",
          "What are the metrics we should be using to evaluate success?"
        ];
        
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: randomParticipant.id,
          senderName: randomParticipant.name,
          content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, newMsg]);
      }
    }, 10000);

    return () => {
      clearInterval(timer);
      clearInterval(typingInterval);
      clearInterval(messageInterval);
      
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, session, navigate, toast, user, participants]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function setupVideoStream() {
      try {
        if (isVideoOn) {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: isMicOn 
          });
          
          setLocalStream(stream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          
          toast({
            title: "Camera enabled",
            description: "Your video is now visible to others",
            duration: 2000
          });
        } else if (localStream) {
          localStream.getVideoTracks().forEach(track => track.stop());
          
          if (isMicOn) {
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              setLocalStream(audioStream);
            } catch (error) {
              console.error("Error creating audio-only stream:", error);
            }
          } else {
            setLocalStream(null);
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setIsVideoOn(false);
        toast({
          variant: "destructive",
          title: "Camera access denied",
          description: "Please check your browser permissions",
        });
      }
    }

    setupVideoStream();
  }, [isVideoOn, toast]);

  useEffect(() => {
    async function setupMicStream() {
      try {
        if (isMicOn) {
          if (localStream && localStream.getVideoTracks().length > 0) {
            if (localStream.getAudioTracks().length === 0) {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const audioTrack = audioStream.getAudioTracks()[0];
              localStream.addTrack(audioTrack);
            } else {
              localStream.getAudioTracks().forEach(track => track.enabled = true);
            }
          } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setLocalStream(stream);
          }
          
          toast({
            title: "Microphone enabled",
            description: "Others can now hear you",
            duration: 2000
          });
        } else if (localStream) {
          localStream.getAudioTracks().forEach(track => {
            track.enabled = false;
            track.stop();
          });
          
          if (localStream.getVideoTracks().length === 0) {
            setLocalStream(null);
          }
        }
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setIsMicOn(false);
        toast({
          variant: "destructive",
          title: "Microphone access denied",
          description: "Please check your browser permissions",
        });
      }
    }

    setupMicStream();
  }, [isMicOn, localStream, toast]);

  useEffect(() => {
    async function setupScreenShare() {
      if (isScreenSharing) {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true,
            audio: true 
          });
          
          setScreenStream(stream);
          
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = stream;
          }
          
          stream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
          };
          
          toast({
            title: "Screen sharing started",
            description: "Your screen is now visible to others",
            duration: 2000
          });
        } catch (error) {
          console.error("Error sharing screen:", error);
          setIsScreenSharing(false);
          toast({
            variant: "destructive",
            title: "Screen sharing failed",
            description: "Unable to share your screen",
          });
        }
      } else if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
    }

    setupScreenShare();
  }, [isScreenSharing, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user?.id || "unknown",
      senderName: user?.name || "You",
      content: newMessage,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const toggleMic = () => {
    setIsMicOn(prev => !prev);
  };

  const toggleVideo = () => {
    setIsVideoOn(prev => !prev);
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(prev => !prev);
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setIsParticipantListOpen(false);
    }
  };

  const toggleParticipantList = () => {
    setIsParticipantListOpen(prev => !prev);
    if (!isParticipantListOpen) {
      setIsChatOpen(false);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-muted/30 animate-fade-in">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="flex items-center" 
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                size="sm"
                variant={isMicOn ? "default" : "outline"}
                className="flex items-center"
                onClick={toggleMic}
              >
                {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button 
                size="sm"
                variant={isVideoOn ? "default" : "outline"}
                className="flex items-center"
                onClick={toggleVideo}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="bg-mockmate-primary/10 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{session.title}</h2>
                  <p className="text-sm text-foreground/70">{session.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-mockmate-primary" />
                  <span className={`font-mono text-lg ${timeLeft < 60 ? "text-destructive" : ""}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isScreenSharing && (
                    <div className="col-span-full bg-black rounded-lg overflow-hidden aspect-video relative">
                      <video 
                        ref={screenVideoRef}
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                        Screen Share
                      </div>
                    </div>
                  )}
                  
                  {isVideoOn ? (
                    <div className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl">
                        {user?.name?.charAt(0) || '?'}
                      </div>
                    </div>
                  )}
                  
                  {participants
                    .filter(p => p.id !== user?.id)
                    .map(participant => (
                      <div 
                        key={participant.id} 
                        className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video"
                      >
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-white text-2xl">
                            {participant.name.charAt(0)}
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="bg-black/50 text-white px-2 py-1 text-xs rounded">
                            {participant.name} {Math.random() > 0.5 ? '' : '(Muted)'}
                          </span>
                          <div className="flex space-x-1">
                            {!isMicOn && <MicOff className="h-4 w-4 text-white bg-red-600 rounded-full p-0.5" />}
                            {!isVideoOn && <VideoOff className="h-4 w-4 text-white bg-red-600 rounded-full p-0.5" />}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  <Button 
                    onClick={toggleMic}
                    variant={isMicOn ? "default" : "outline"} 
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button 
                    onClick={toggleVideo}
                    variant={isVideoOn ? "default" : "outline"} 
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button 
                    onClick={toggleScreenShare}
                    variant={isScreenSharing ? "destructive" : "outline"} 
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
                  </Button>
                  <Button 
                    onClick={toggleChat}
                    variant={isChatOpen ? "default" : "outline"} 
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <Button 
                    onClick={toggleParticipantList}
                    variant={isParticipantListOpen ? "default" : "outline"} 
                    size="icon"
                    className="rounded-full h-10 w-10 bg-gray-800 text-white hover:bg-gray-700"
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => navigate("/dashboard")}
                    className="rounded-full px-4"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            </div>
            
            {!isChatOpen && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow">
                <div className="p-4 h-[calc(100vh-460px)] overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map(message => {
                      const isCurrentUser = message.senderId === user?.id;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                        >
                          <div 
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser 
                                ? "bg-mockmate-primary text-white rounded-br-none"
                                : "bg-muted rounded-bl-none"
                            } animate-fade-in`}
                          >
                            {!isCurrentUser && (
                              <div className="font-medium text-sm mb-1">{message.senderName}</div>
                            )}
                            <div>{message.content}</div>
                            <div className="text-xs text-right mt-1 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {typingUsers.length > 0 && (
                      <div className="flex items-center text-sm text-foreground/60 animate-pulse">
                        <span>{typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...</span>
                      </div>
                    )}
                    
                    <div ref={messageEndRef} />
                  </div>
                </div>

                <div className="border-t p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="btn-effect">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {(isChatOpen || isParticipantListOpen) && (
            <div className="w-full md:w-80 bg-white rounded-lg shadow-md overflow-hidden animate-fade-in">
              {isChatOpen && (
                <>
                  <div className="bg-mockmate-primary/10 p-4 flex justify-between items-center">
                    <h3 className="font-semibold">Chat</h3>
                    <Button variant="ghost" size="sm" onClick={toggleChat}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 h-[calc(100vh-340px)] overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map(message => {
                        const isCurrentUser = message.senderId === user?.id;
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div 
                              className={`max-w-[90%] rounded-lg p-3 ${
                                isCurrentUser 
                                  ? "bg-mockmate-primary text-white rounded-br-none"
                                  : "bg-muted rounded-bl-none"
                              } animate-fade-in`}
                            >
                              {!isCurrentUser && (
                                <div className="font-medium text-sm mb-1">{message.senderName}</div>
                              )}
                              <div>{message.content}</div>
                              <div className="text-xs text-right mt-1 opacity-70">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {typingUsers.length > 0 && (
                        <div className="flex items-center text-sm text-foreground/60 animate-pulse">
                          <span>{typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...</span>
                        </div>
                      )}
                      
                      <div ref={messageEndRef} />
                    </div>
                  </div>
                  <div className="border-t p-4">
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input 
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" className="btn-effect">
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </>
              )}

              {isParticipantListOpen && (
                <>
                  <div className="bg-mockmate-primary/10 p-4 flex justify-between items-center">
                    <h3 className="font-semibold">Participants ({participants.length})</h3>
                    <Button variant="ghost" size="sm" onClick={toggleParticipantList}>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4 h-[calc(100vh-340px)] overflow-y-auto">
                    <div className="space-y-2">
                      {participants.map(participant => (
                        <div 
                          key={participant.id} 
                          className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-mockmate-primary/20 flex items-center justify-center text-mockmate-primary font-bold">
                                {participant.name.charAt(0)}
                              </div>
                              {participant.isActive && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {participant.name} {participant.id === user?.id && "(You)"}
                              </div>
                              <div className="text-xs text-foreground/60 capitalize">
                                {participant.role}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {participant.id === user?.id ? (
                              <>
                                {!isMicOn && <MicOff className="h-4 w-4 text-gray-400" />}
                                {!isVideoOn && <VideoOff className="h-4 w-4 text-gray-400" />}
                              </>
                            ) : (
                              <>
                                {Math.random() > 0.5 && <MicOff className="h-4 w-4 text-gray-400" />}
                                {Math.random() > 0.7 && <VideoOff className="h-4 w-4 text-gray-400" />}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionRoom;
