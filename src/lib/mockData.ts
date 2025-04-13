
export interface Session {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'active' | 'completed';
  date: string;
  duration: number; // in minutes
  participants: Participant[];
  moderatorId: string;
  evaluatorIds: string[];
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'moderator' | 'participant' | 'evaluator';
  isActive?: boolean;
  isSpeaking?: boolean;
  hasCamera?: boolean;
  hasMic?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Feedback {
  id: string;
  participantId: string;
  evaluatorId: string;
  sessionId: string;
  clarity: number;
  content: number;
  delivery: number;
  engagement: number;
  overall: number;
  comments: string;
  timestamp: string;
}

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    title: 'Impact of Artificial Intelligence on Job Market',
    description: 'A discussion about how AI is changing employment opportunities and challenges across various industries.',
    status: 'upcoming',
    date: '2025-04-15T14:00:00.000Z',
    duration: 45,
    participants: [
      { id: 'user-1', name: 'Alex Johnson', email: 'alex@example.com', avatar: '/placeholder.svg', role: 'moderator' },
      { id: 'user-2', name: 'Jamie Smith', email: 'jamie@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-3', name: 'Taylor Brown', email: 'taylor@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-4', name: 'Morgan Lee', email: 'morgan@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-5', name: 'Casey Wilson', email: 'casey@example.com', avatar: '/placeholder.svg', role: 'evaluator' }
    ],
    moderatorId: 'user-1',
    evaluatorIds: ['user-5']
  },
  {
    id: 'session-2',
    title: 'Sustainable Business Practices',
    description: 'Exploring how companies can implement eco-friendly strategies while maintaining profitability.',
    status: 'active',
    date: '2025-04-12T10:00:00.000Z',
    duration: 60,
    participants: [
      { id: 'user-6', name: 'Jordan Parker', email: 'jordan@example.com', avatar: '/placeholder.svg', role: 'moderator' },
      { id: 'user-7', name: 'Riley Cooper', email: 'riley@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-8', name: 'Quinn Evans', email: 'quinn@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-9', name: 'Avery Martinez', email: 'avery@example.com', avatar: '/placeholder.svg', role: 'evaluator' }
    ],
    moderatorId: 'user-6',
    evaluatorIds: ['user-9']
  },
  {
    id: 'session-3',
    title: 'Future of Remote Work',
    description: 'Discussing the long-term impacts of remote work on company culture and productivity.',
    status: 'completed',
    date: '2025-04-05T15:30:00.000Z',
    duration: 50,
    participants: [
      { id: 'user-10', name: 'Sam Rivera', email: 'sam@example.com', avatar: '/placeholder.svg', role: 'moderator' },
      { id: 'user-11', name: 'Drew Morgan', email: 'drew@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-12', name: 'Jordan Casey', email: 'jordanc@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-13', name: 'Taylor Reed', email: 'taylorreed@example.com', avatar: '/placeholder.svg', role: 'participant' },
      { id: 'user-14', name: 'Alex Kim', email: 'alexkim@example.com', avatar: '/placeholder.svg', role: 'evaluator' }
    ],
    moderatorId: 'user-10',
    evaluatorIds: ['user-14']
  }
];

export const mockMessages: Record<string, Message[]> = {
  'session-2': [
    {
      id: 'msg-1',
      senderId: 'user-6',
      senderName: 'Jordan Parker',
      content: 'Welcome everyone to our discussion on Sustainable Business Practices. Let\'s start by defining what sustainability means in a business context.',
      timestamp: '2025-04-12T10:01:00.000Z'
    },
    {
      id: 'msg-2',
      senderId: 'user-7',
      senderName: 'Riley Cooper',
      content: 'I think sustainability in business refers to operating in a way that meets our present needs without compromising future generations - both environmentally and economically.',
      timestamp: '2025-04-12T10:03:00.000Z'
    },
    {
      id: 'msg-3',
      senderId: 'user-8',
      senderName: 'Quinn Evans',
      content: 'Agreed, and I would add that it also includes social sustainability - ensuring fair labor practices and giving back to communities.',
      timestamp: '2025-04-12T10:05:00.000Z'
    }
  ]
};

export const mockFeedback: Feedback[] = [
  {
    id: 'feedback-1',
    participantId: 'user-11',
    evaluatorId: 'user-14',
    sessionId: 'session-3',
    clarity: 4,
    content: 5,
    delivery: 3,
    engagement: 4,
    overall: 4,
    comments: 'Drew made excellent points about remote work productivity tools. Could improve on delivery by modulating tone more.',
    timestamp: '2025-04-05T16:35:00.000Z'
  },
  {
    id: 'feedback-2',
    participantId: 'user-12',
    evaluatorId: 'user-14',
    sessionId: 'session-3',
    clarity: 5,
    content: 4,
    delivery: 5,
    engagement: 4,
    overall: 4.5,
    comments: 'Jordan presented very clear arguments with excellent delivery. Could incorporate more specific examples.',
    timestamp: '2025-04-05T16:37:00.000Z'
  },
  {
    id: 'feedback-3',
    participantId: 'user-13',
    evaluatorId: 'user-14',
    sessionId: 'session-3',
    clarity: 3,
    content: 5,
    delivery: 4,
    engagement: 3,
    overall: 3.75,
    comments: 'Taylor had deep knowledge but points were sometimes too complex for quick understanding. Great engagement with others\' points.',
    timestamp: '2025-04-05T16:40:00.000Z'
  },
];

// Create a singleton to manage mock data
type SessionsListener = (sessions: Session[]) => void;

export const mockDataManager = {
  sessions: [...mockSessions],
  listeners: [] as SessionsListener[],
  
  // Get all sessions
  getAllSessions: () => {
    return mockDataManager.sessions;
  },
  
  // Get session by ID
  getSessionById: (id: string) => {
    return mockDataManager.sessions.find(session => session.id === id) || null;
  },
  
  // Create new session
  createSession: (session: Omit<Session, 'id'>) => {
    const newSession = {
      ...session,
      id: `session-${mockDataManager.sessions.length + 1}-${Date.now()}`
    };
    mockDataManager.sessions.push(newSession);
    mockDataManager.notifyListeners();
    return newSession;
  },
  
  // Update session
  updateSession: (updatedSession: Session) => {
    const index = mockDataManager.sessions.findIndex(s => s.id === updatedSession.id);
    if (index !== -1) {
      mockDataManager.sessions[index] = updatedSession;
      mockDataManager.notifyListeners();
      return true;
    }
    return false;
  },
  
  // Delete session
  deleteSession: (id: string) => {
    const initialLength = mockDataManager.sessions.length;
    mockDataManager.sessions = mockDataManager.sessions.filter(s => s.id !== id);
    if (mockDataManager.sessions.length < initialLength) {
      mockDataManager.notifyListeners();
      return true;
    }
    return false;
  },
  
  // Add a listener for session updates
  addListener: (listener: SessionsListener) => {
    mockDataManager.listeners.push(listener);
  },
  
  // Remove a listener
  removeListener: (listener: SessionsListener) => {
    mockDataManager.listeners = mockDataManager.listeners.filter(l => l !== listener);
  },
  
  // Notify all listeners of changes
  notifyListeners: () => {
    mockDataManager.listeners.forEach(listener => listener(mockDataManager.sessions));
  }
};
