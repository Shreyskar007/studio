import { format as formatTz } from 'date-fns-tz';
import { Meeting } from '@/hooks/use-meetings';

export const generateRedirectUrl = (platform: Meeting['platform'], title: string, date: string) => {
    const meetingDate = new Date(date);
    
    switch (platform) {
        case 'Google Meet':
            // Google Calendar link to create an event with a Meet link
            const googleDate = formatTz(meetingDate, "yyyyMMdd'T'HHmmss'Z'", { timeZone: 'UTC' });
            return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${googleDate}/${googleDate}&details=Meeting+created+from+MeetFlow&addGoogleMeet=true`;
        case 'Zoom':
            // Zoom doesn't have a simple URL-based meeting creation form with pre-filled details.
            // This is a placeholder link to their scheduling page.
            return `https://zoom.us/meeting/schedule`;
        case 'Microsoft Teams':
            // Microsoft Teams URL to pre-fill the meeting subject.
            return `https://teams.microsoft.com/l/meeting/new?subject=${encodeURIComponent(title)}`;
    }
}
