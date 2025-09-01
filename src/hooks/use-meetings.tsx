
'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import {
  addMinutes,
  startOfToday,
} from 'date-fns';
import { generateMeetingLink } from '@/lib/meeting-utils';

export interface Meeting {
  id: string; // Unique ID for our internal list
  meetingId: string; // The ID from the external platform (e.g., Zoom ID)
  title: string;
  date: string; // ISO string for consistency
  platform: 'Google Meet' | 'Zoom' | 'Microsoft Teams';
  link: string; // The join URL
  summary?: string;
}

interface MeetingsContextType {
  meetings: Meeting[];
  addMeeting: (meeting: Omit<Meeting, 'id' | 'link' | 'meetingId' | 'summary'>) => void;
}

const MeetingsContext = createContext<MeetingsContextType | undefined>(
  undefined
);

// Mock initial data
const today = startOfToday();
const initialMeetings: Meeting[] = [
  {
    id: '1',
    meetingId: 'mock-meeting-1',
    title: 'Project Phoenix - Standup',
    date: addMinutes(today, 10 * 60).toISOString(),
    platform: 'Google Meet',
    link: 'https://meet.google.com/lookup/mock-meeting-1',
    summary:
      'The team discussed the current sprint progress. Alice will deploy the new staging build by EOD. Bob is blocked by the API team.',
  },
  {
    id: '2',
    meetingId: 'mock-meeting-2',
    title: '1-on-1 with Manager',
    date: addMinutes(today, 14 * 60).toISOString(),
    platform: 'Zoom',
    link: 'https://zoom.us/j/mock-meeting-2',
    summary: 'Performance review and discussion about future career goals.',
  },
];


export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const addMeeting = useCallback(
    (meetingData: Omit<Meeting, 'id' | 'link' | 'meetingId' | 'summary'>) => {
       const newMeeting: Meeting = {
        ...meetingData,
        id: new Date().toISOString(),
        meetingId: `mock-${Math.random().toString(36).substring(2, 12)}`,
        summary: `This is a placeholder summary for the meeting: "${meetingData.title}". A real summary would be generated from the transcript after the meeting.`,
       };
       newMeeting.link = generateMeetingLink(newMeeting.platform, newMeeting.meetingId);

      setMeetings((prev) => [...prev, newMeeting].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    },
    []
  );

  const value = { meetings, addMeeting };

  return (
    <MeetingsContext.Provider value={value}>
      {children}
    </MeetingsContext.Provider>
  );
};

export const useMeetings = () => {
  const context = useContext(MeetingsContext);
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingsProvider');
  }
  return context;
};
