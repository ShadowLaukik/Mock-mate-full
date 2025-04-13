
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Plus, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@/lib/mockData";

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (newSession: Session) => void;
}

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  duration: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Duration must be a positive number",
  }),
  participants: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      role: z.enum(["participant", "evaluator"])
    })
  )
});

type FormData = z.infer<typeof formSchema>;

const CreateSessionModal = ({ isOpen, onClose, onCreateSession }: CreateSessionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantRole, setParticipantRole] = useState<"participant" | "evaluator">("participant");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      duration: "45",
      participants: []
    },
  });

  const addParticipant = () => {
    if (!participantEmail) return;
    
    // Check if email is already added
    const exists = form.getValues().participants.some(p => p.email === participantEmail);
    
    if (exists) {
      toast({
        title: "Participant already added",
        description: "This email is already in the participant list.",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue("participants", [
      ...form.getValues().participants, 
      { email: participantEmail, role: participantRole }
    ]);
    setParticipantEmail("");
  };

  const removeParticipant = (index: number) => {
    const participants = form.getValues().participants;
    participants.splice(index, 1);
    form.setValue("participants", [...participants]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Need to actually call onCreateSession here with the new session data
      const newSession: Session = {
        id: `temp-${Date.now()}`, // Temporary ID, will be replaced by mockDataManager
        title: data.title,
        description: data.description,
        date: data.date,
        duration: Number(data.duration),
        status: 'upcoming',
        participants: data.participants.map((p, index) => ({
          id: `temp-participant-${index}`,
          name: p.email.split('@')[0], // Simple name extraction from email
          email: p.email,
          avatar: '/placeholder.svg',
          role: p.role
        })),
        moderatorId: 'user-1', // Using default moderator ID
        evaluatorIds: data.participants
          .filter(p => p.role === 'evaluator')
          .map((_, index) => `temp-evaluator-${index}`)
      };
      
      onCreateSession(newSession);

      toast({
        title: "Session created",
        description: "Your discussion session has been successfully created.",
      });

      onClose();
      form.reset();
    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: "Failed to create the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Discussion Session</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Digital Marketing Strategies" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a brief description of the discussion topic" 
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input type="datetime-local" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" min="5" step="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Participants & Evaluators</FormLabel>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Email address" 
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  className="flex-1"
                />
                <select 
                  value={participantRole}
                  onChange={(e) => setParticipantRole(e.target.value as "participant" | "evaluator")}
                  className="bg-background border border-input rounded-md px-3 py-2"
                >
                  <option value="participant">Participant</option>
                  <option value="evaluator">Evaluator</option>
                </select>
                <Button type="button" size="icon" onClick={addParticipant}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-2">
                {form.getValues().participants.length > 0 ? (
                  <div className="space-y-2">
                    {form.getValues().participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <span className={participant.role === 'evaluator' ? 'text-mockmate-accent' : 'text-mockmate-primary'}>
                            {participant.role === 'evaluator' ? '🔍' : '👤'}
                          </span>
                          <span>{participant.email}</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeParticipant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No participants added yet</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Session
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSessionModal;
