
'use client';

import { useState } from 'react';
import {
  isSameDay,
  format,
  parseISO,
} from 'date-fns';
import { Calendar as CalendarIcon, Video, Users, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMeetings } from '@/hooks/use-meetings';
import { AuthGuard } from '@/components/auth-guard';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


const getPlatformIcon = (platform: string, className = "h-4 w-4") => {
    if (platform === 'Google Meet') return <Users className={className} />;
    if (platform === 'Zoom') return <Video className={className} />;
    if (platform === 'Microsoft Teams') return <Users className={className} />;
    return <Video className={className} />;
};


export default function CalendarPage() {
  const { signOut } = useAuth();
  const { meetings } = useMeetings();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());

  const meetingsOnSelectedDate = meetings.filter((meeting) =>
    isSameDay(parseISO(meeting.date), selectedDate)
  ).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const meetingDates = meetings.map((m) => parseISO(m.date));

  return (
    <AuthGuard>
      <SidebarProvider>
         <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton>
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/calendar">
                   <SidebarMenuButton isActive>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    Calendar
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
        <main className="p-4 md:p-8">
           <h1 className="text-3xl font-bold mb-8">Calendar</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2">
               <Card>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(day) => day && setSelectedDate(day)}
                  month={displayedMonth}
                  onMonthChange={setDisplayedMonth}
                  modifiers={{ scheduled: meetingDates }}
                  modifiersClassNames={{
                    scheduled: 'bg-primary/20 text-primary-foreground rounded-full',
                  }}
                  className="p-0 sm:p-3"
                />
               </Card>
            </div>

            <div className="space-y-6">
               <h2 className="text-2xl font-semibold">
                  Schedule for <br />
                  <span className="text-primary">{format(selectedDate, 'MMMM d, yyyy')}</span>
                </h2>
                {meetingsOnSelectedDate.length > 0 ? (
                  <ul className="space-y-4">
                    {meetingsOnSelectedDate.map((meeting) => (
                       <li key={meeting.id}>
                         <Card className="hover:shadow-md transition-shadow duration-200">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-base mb-2">{meeting.title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                                {getPlatformIcon(meeting.platform, "h-4 w-4 mr-2")}
                                <span>{meeting.platform}</span>
                                <span className="mx-2">|</span>
                                <Clock className="h-4 w-4 mr-1.5" />
                                <span>{format(parseISO(meeting.date), 'p')}</span>
                            </div>
                            
                            <p className="text-sm p-3 bg-muted rounded-md border">{meeting.summary}</p>
                           
                           <Link
                              href={meeting.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="secondary" size="sm" className="w-full mt-4">
                                Join Meeting
                              </Button>
                            </Link>
                          </CardContent>
                         </Card>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold">No Meetings</h3>
                      <p className="text-sm text-muted-foreground">
                        There are no meetings scheduled for this date.
                      </p>
                  </Card>
                )}
            </div>
          </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
