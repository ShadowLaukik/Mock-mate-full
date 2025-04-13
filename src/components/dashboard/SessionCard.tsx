
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Session } from "@/lib/mockData";
import { Calendar, Clock, Users, ArrowRight, Video, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import EditSessionModal from "@/components/dashboard/EditSessionModal";

interface SessionCardProps {
  session: Session;
  role: "moderator" | "participant" | "evaluator";
  onSessionUpdate?: (updatedSession: Session) => void;
}

const SessionCard = ({ session, role, onSessionUpdate }: SessionCardProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const sessionDate = new Date(session.date);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = sessionDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const participantCount = session.participants.filter(
    (p) => p.role === "participant"
  ).length;

  const handleEditSession = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateSession = (updatedSession: Session) => {
    if (onSessionUpdate) {
      onSessionUpdate(updatedSession);
    }
    setIsEditModalOpen(false);
  };

  const renderActionButton = () => {
    if (session.status === "active") {
      return (
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/discussion/${session.id}`}>
            <Button variant="outline" className="w-full">
              Text Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/camera/${session.id}`}>
            <Button className="w-full btn-effect">
              <Video className="mr-2 h-4 w-4" />
              Join Video
            </Button>
          </Link>
        </div>
      );
    } else if (session.status === "upcoming") {
      return (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={role === "moderator" ? handleEditSession : undefined}
        >
          {role === "moderator" ? (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Session
            </>
          ) : "View Details"}
        </Button>
      );
    } else {
      return (
        <Link to={`/feedback/session/${session.id}`}>
          <Button variant="outline" className="w-full">
            {role === "moderator"
              ? "View Results"
              : role === "evaluator"
              ? "View Evaluations"
              : "View Feedback"}
          </Button>
        </Link>
      );
    }
  };

  const getStatusColor = () => {
    switch (session.status) {
      case "active":
        return "bg-green-500";
      case "upcoming":
        return "bg-blue-500";
      case "completed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{session.title}</h3>
            <Badge className={getStatusColor()}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-foreground/70 line-clamp-2 mb-4">
            {session.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-foreground/70">
              <Calendar className="h-4 w-4 mr-2 text-mockmate-primary" />
              {formattedDate} at {formattedTime}
            </div>
            <div className="flex items-center text-sm text-foreground/70">
              <Clock className="h-4 w-4 mr-2 text-mockmate-secondary" />
              {session.duration} minutes
            </div>
            <div className="flex items-center text-sm text-foreground/70">
              <Users className="h-4 w-4 mr-2 text-mockmate-accent" />
              {participantCount} participants
            </div>
          </div>
          
          {renderActionButton()}
        </div>
      </div>

      {isEditModalOpen && (
        <EditSessionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          session={session}
          onUpdate={handleUpdateSession}
        />
      )}
    </>
  );
};

export default SessionCard;
