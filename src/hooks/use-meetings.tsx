
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
  startOfToday
} from 'date-fns';

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
  addMeeting: (meeting: Omit<Meeting, 'id' | 'link' | 'summary' | 'meetingId'>) => void;
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

const generateMeetingDetails = (platform: Meeting['platform'], title: string) => {
    const slug = title.toLowerCase().replace(/\s+/g, '-').substring(0, 20);
    const randomId = Math.random().toString(36).substring(2, 12);
    const meetingId = `${slug}-${randomId}`;

    let link = '#';
    switch (platform) {
        case 'Google Meet':
            link = `https://meet.google.com/lookup/${meetingId}`;
            break;
        case 'Zoom':
             link = `https://zoom.us/j/${meetingId}`;
            break;
        case 'Microsoft Teams':
            link = `https://teams.microsoft.com/l/meetup-join/19%3ameeting_${meetingId}`;
            break;
    }
    return { link, meetingId };
}


export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const addMeeting = useCallback(
    (meetingData: Omit<Meeting, 'id' | 'link' | 'summary' | 'meetingId'>) => {
      const { link, meetingId } = generateMeetingDetails(meetingData.platform, meetingData.title);
      const newMeeting: Meeting = {
        ...meetingData,
        id: new Date().toISOString() + Math.random(),
        meetingId: meetingId,
        link: link,
        summary: `This is a placeholder summary for the meeting: "${meetingData.title}". A real summary would be generated from the transcript after the meeting.`,
      };
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
