
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Participant } from "@/lib/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
  sessionId: string;
}

interface Rating {
  name: string;
  label: string;
  value: number;
  description: string;
}

const FeedbackForm = ({ isOpen, onClose, participant, sessionId }: FeedbackFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState("");
  const [ratings, setRatings] = useState<Rating[]>([
    { name: "clarity", label: "Communication Clarity", value: 3, description: "How clearly did the participant express their ideas?" },
    { name: "content", label: "Content Quality", value: 3, description: "How relevant and insightful was the content shared?" },
    { name: "delivery", label: "Delivery Style", value: 3, description: "How effective was the participant's delivery and presence?" },
    { name: "engagement", label: "Group Engagement", value: 3, description: "How well did they engage with other participants?" },
  ]);

  const calculateOverall = () => {
    const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleRatingChange = (name: string, value: number[]) => {
    setRatings(ratings.map(rating => 
      rating.name === name ? { ...rating, value: value[0] } : rating
    ));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Feedback submitted",
        description: `Your feedback for ${participant.name} has been successfully recorded.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit feedback. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate star display for a rating
  const renderStars = (value: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-5 w-5 ${
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Evaluate {participant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Rating sliders */}
          <div className="space-y-6">
            {ratings.map(rating => (
              <div key={rating.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium text-sm">{rating.label}</label>
                  {renderStars(rating.value)}
                </div>
                <Slider
                  value={[rating.value]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => handleRatingChange(rating.name, value)}
                />
                <p className="text-xs text-muted-foreground">{rating.description}</p>
              </div>
            ))}
          </div>

          {/* Overall rating display */}
          <div className="bg-muted/30 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Overall Rating</span>
              <div className="flex items-center space-x-2">
                {renderStars(parseFloat(calculateOverall()))}
                <span className="text-lg font-semibold">{calculateOverall()}</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <label className="font-medium text-sm">Detailed Feedback</label>
            <Textarea
              placeholder="Provide specific feedback on strengths and areas for improvement..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !comments}
            className="btn-effect"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
