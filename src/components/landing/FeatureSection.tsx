
import { useEffect, useRef } from "react";
import { 
  MessageSquare, 
  Clock, 
  BarChart4, 
  Award, 
  Users, 
  UserCheck 
} from "lucide-react";

const features = [
  {
    icon: <MessageSquare className="h-8 w-8 text-mockmate-primary" />,
    title: "Real-time Group Discussions",
    description: "Engage in live, structured discussions with peers on a variety of topics to improve your communication skills."
  },
  {
    icon: <Clock className="h-8 w-8 text-mockmate-primary" />,
    title: "Timed Sessions",
    description: "Practice working within time constraints with our configurable timers to improve your conciseness and clarity."
  },
  {
    icon: <BarChart4 className="h-8 w-8 text-mockmate-primary" />,
    title: "Detailed Analytics",
    description: "Receive comprehensive performance metrics and improvement trends through our intuitive visualizations."
  },
  {
    icon: <Award className="h-8 w-8 text-mockmate-primary" />,
    title: "Expert Feedback",
    description: "Get personalized feedback from evaluators on your communication style, content, and delivery."
  },
  {
    icon: <Users className="h-8 w-8 text-mockmate-primary" />,
    title: "Role-based Learning",
    description: "Experience different perspectives by participating as a moderator, participant, or evaluator."
  },
  {
    icon: <UserCheck className="h-8 w-8 text-mockmate-primary" />,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed session history and performance metrics."
  }
];

const FeatureSection = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    }, { threshold: 0.1 });
    
    featureRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      featureRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);
  
  return (
    <section id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 intersect-animate" ref={el => featureRefs.current[0] = el}>
          <h2 className="heading-lg mb-4">Powerful Features</h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Everything you need to practice and perfect your group discussion and interview skills in one platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              ref={el => featureRefs.current[index + 1] = el}
              className="card-animated intersect-animate"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-foreground/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
