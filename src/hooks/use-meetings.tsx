
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
} from 'react';

// Define the shape of a meeting object
export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO 8601 format
  platform: string;
  status: 'Completed' | 'Scheduled';
}

// Initial set of meetings for demonstration
const initialMeetings: Meeting[] = [
  {
    id: 'M001',
    title: 'Q3 Project Kickoff',
    date: '2023-10-26T10:00:00.000Z',
    platform: 'Google Meet',
    status: 'Completed',
  },
  {
    id: 'M002',
    title: 'Marketing Sync',
    date: '2023-10-25T14:30:00.000Z',
    platform: 'Zoom',
    status: 'Completed',
  },
  {
    id: 'M003',
    title: 'Sprint Planning',
    date: '2023-10-24T09:00:00.000Z',
    platform: 'Teams',
    status: 'Completed',
  },
  {
    id: 'M004',
    title: 'Client Demo Prep',
    date: '2023-10-23T16:00:00.000Z',
    platform: 'Google Meet',
    status: 'Completed',
  },
];


// Define the context type
interface MeetingsContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Meeting) => void;
}

// Create the context
const MeetingsContext = createContext<MeetingsContextType | undefined>(undefined);

// Create the provider component
export const MeetingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const addMeeting = (meeting: Meeting) => {
    setMeetings((prevMeetings) => [meeting, ...prevMeetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const value = {
    meetings,
    addMeeting,
  };

  return (
    <MeetingsContext.Provider value={value}>
      {children}
    </MeetingsContext.Provider>
  );
};

// Create a custom hook to use the meetings context
export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};
