
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { useRef, useEffect } from "react";
import { User, Users, ClipboardCheck } from "lucide-react";

const roles = [
  {
    id: "moderator",
    icon: <User size={48} className="text-mockmate-primary" />,
    title: "Moderator",
    description: "Lead discussions, set topics, and facilitate productive conversations among participants.",
    benefits: [
      "Create and manage discussion sessions",
      "Develop leadership and facilitation skills",
      "Practice guiding conversations effectively",
      "Receive feedback on your moderation style"
    ]
  },
  {
    id: "participant",
    icon: <Users size={48} className="text-mockmate-secondary" />,
    title: "Participant",
    description: "Join discussions, share your ideas, and practice articulating your thoughts effectively.",
    benefits: [
      "Improve communication and persuasion skills",
      "Build confidence in group settings",
      "Receive personalized feedback on your performance",
      "Track your progress over multiple sessions"
    ]
  },
  {
    id: "evaluator",
    icon: <ClipboardCheck size={48} className="text-mockmate-accent" />,
    title: "Evaluator",
    description: "Observe discussions, provide constructive feedback, and help others improve their skills.",
    benefits: [
      "Develop critical analysis skills",
      "Learn to provide effective feedback",
      "Gain insights from observing different communication styles",
      "Help shape the growth of other professionals"
    ]
  }
];

const RoleSection = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const roleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });
    
    roleRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      roleRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setAuthModalOpen(true);
  };

  return (
    <>
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 intersect-animate" ref={el => roleRefs.current[0] = el}>
            <h2 className="heading-lg mb-4">Choose Your Role</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              MockMate offers different experiences based on your learning goals. Select the role that best fits your development needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {roles.map((role, index) => (
              <div 
                key={role.id}
                ref={el => roleRefs.current[index + 1] = el}
                className={`rounded-xl overflow-hidden shadow-md border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 intersect-animate ${
                  index === 0 ? "border-mockmate-primary/30" : 
                  index === 1 ? "border-mockmate-secondary/30" : 
                  "border-mockmate-accent/30"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`p-6 ${
                  index === 0 ? "bg-mockmate-primary/5" : 
                  index === 1 ? "bg-mockmate-secondary/5" : 
                  "bg-mockmate-accent/5"
                }`}>
                  <div className="mb-4 flex justify-center">{role.icon}</div>
                  <h3 className="text-2xl font-bold mb-2 text-center">{role.title}</h3>
                  <p className="text-foreground/80 text-center">{role.description}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2 mb-6">
                    {role.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start">
                        <span className={`mr-2 text-xl ${
                          index === 0 ? "text-mockmate-primary" : 
                          index === 1 ? "text-mockmate-secondary" : 
                          "text-mockmate-accent"
                        }`}>•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full btn-effect"
                    onClick={() => handleRoleSelect(role.id)}
                    variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}
                  >
                    Join as {role.title}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialView="signup"
        initialRole={selectedRole as "moderator" | "participant" | "evaluator" | undefined}
      />
    </>
  );
};

export default RoleSection;
