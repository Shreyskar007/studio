
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
  format as formatTz,
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

const generateRedirectUrl = (platform: Meeting['platform'], title: string, date: string) => {
    const meetingDate = new Date(date);
    const startTime = formatTz(meetingDate, "HH:mm");
    const startDate = formatTz(meetingDate, "yyyy-MM-dd");

    switch (platform) {
        case 'Google Meet':
            const googleDate = formatTz(meetingDate, "yyyyMMdd'T'HHmmss'Z'");
            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${googleDate}/${googleDate}&details=Meeting+created+from+MeetFlow`;
        case 'Zoom':
            // Zoom doesn't have a simple URL-based meeting creation form. This is a placeholder.
             return `https://zoom.us/meeting/schedule`;
        case 'Microsoft Teams':
            // Microsoft Teams also requires API interaction for pre-filled meetings.
            return `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(title)}`;
    }
}


export const MeetingsProvider = ({ children }: { children: ReactNode }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const addMeeting = useCallback(
    (meetingData: Omit<Meeting, 'id' | 'link' | 'summary' | 'meetingId'>) => {
      const redirectUrl = generateRedirectUrl(meetingData.platform, meetingData.title, meetingData.date);
      if (redirectUrl) {
          window.open(redirectUrl, '_blank');
      }
      // Note: In a real app, you wouldn't add the meeting here.
      // You'd have a backend listener for a callback from the calendar provider
      // to create the meeting in your DB after it's made on the platform.
      // For this mock, we'll add it anyway so it appears in the list.

      const newMeeting: Meeting = {
        ...meetingData,
        id: new Date().toISOString() + Math.random(),
        meetingId: `mock-${Math.random().toString(36).substring(2, 9)}`,
        link: '#', // The real link would come from the API callback
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
