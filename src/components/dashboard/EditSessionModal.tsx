
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calendar, Save, X, Plus } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Session, Participant } from "@/lib/mockData";

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onUpdate: (updatedSession: Session) => void;
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

const EditSessionModal = ({ isOpen, onClose, session, onUpdate }: EditSessionModalProps) => {
  const [loading, setLoading] = useState(false);
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantRole, setParticipantRole] = useState<"participant" | "evaluator">("participant");
  const { toast } = useToast();

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  // Convert participants to the format expected by the form
  const participantsToFormData = (participants: Participant[]) => {
    return participants
      .filter(p => p.role !== 'moderator')
      .map(p => ({
        email: p.email,
        role: p.role as "participant" | "evaluator"
      }));
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: session?.title || "",
      description: session?.description || "",
      date: session ? formatDateForInput(session.date) : new Date().toISOString().slice(0, 16),
      duration: session?.duration.toString() || "45",
      participants: session ? participantsToFormData(session.participants) : []
    },
  });

  // Re-initialize form when session changes
  useState(() => {
    if (session) {
      form.reset({
        title: session.title,
        description: session.description,
        date: formatDateForInput(session.date),
        duration: session.duration.toString(),
        participants: participantsToFormData(session.participants)
      });
    }
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
    if (!session) return;

    try {
      setLoading(true);

      // Convert FormData participants back to Session participants format
      // Keep the moderator intact
      const moderator = session.participants.find(p => p.role === 'moderator');
      const updatedParticipants = [
        ...(moderator ? [moderator] : []),
        ...data.participants.map((p, index) => {
          // Try to find an existing participant with the same email to preserve their ID
          const existingParticipant = session.participants.find(existing => 
            existing.email === p.email && existing.role === p.role
          );
          
          return existingParticipant || {
            id: `new-user-${index}`,
            name: p.email.split('@')[0], // Simple name extraction from email
            email: p.email,
            avatar: '/placeholder.svg',
            role: p.role,
          };
        })
      ];

      // Update the session with new data
      const updatedSession: Session = {
        ...session,
        title: data.title,
        description: data.description,
        date: new Date(data.date).toISOString(),
        duration: parseInt(data.duration),
        participants: updatedParticipants,
        evaluatorIds: updatedParticipants
          .filter(p => p.role === 'evaluator')
          .map(p => p.id)
      };

      // Call the onUpdate function to update the session in the parent component
      onUpdate(updatedSession);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Session updated",
        description: "Your discussion session has been successfully updated.",
      });

      onClose();
    } catch (error) {
      console.error("Failed to update session:", error);
      toast({
        title: "Error",
        description: "Failed to update the session. Please try again.",
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
          <DialogTitle>Edit Discussion Session</DialogTitle>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Session
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

export default EditSessionModal;
