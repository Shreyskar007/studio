
'use client';

import { useState } from 'react';
import { isSameDay, format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Video, Users, Clock, FileText, Plus, LogOut } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMeetings } from '@/hooks/use-meetings';
import { AuthGuard } from '@/components/auth-guard';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScheduleMeetingForm } from '@/components/schedule-meeting-form';
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
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [displayedMonth, setDisplayedMonth] = useState<Date>(new Date());

  const meetingsOnSelectedDate = meetings.filter((meeting) =>
    isSameDay(parseISO(meeting.date), selectedDate)
  ).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const meetingDates = meetings.map((m) => parseISO(m.date));
  
  const recentTranscripts = meetings
    .filter(m => m.summary && m.summary.toLowerCase().indexOf('placeholder') === -1) // Filter for meetings with actual summaries
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    .slice(0, 5);


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
              <SidebarMenuItem>
                <Link href="/process">
                  <SidebarMenuButton>
                    <FileText className="mr-2 h-4 w-4" />
                    Process Transcript
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
        <main className="p-4">
           <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Calendar</h1>
               <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule a New Meeting</DialogTitle>
                      <DialogDescription>
                        Fill in the details to schedule your next meeting.
                      </DialogDescription>
                    </DialogHeader>
                    <ScheduleMeetingForm
                      onSuccess={() => setDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
           </div>
          <div className="space-y-4">
             <Card className="grid grid-cols-1 md:grid-cols-2 md:gap-x-6 items-start overflow-hidden">
                <div className="py-6 pl-0 pr-12 min-w-0">
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
                    className="w-full"
                  />
                </div>
                <div className="border-l border-border flex flex-col h-full">
                  <div className="p-6">
                    <CardTitle className="text-xl">
                      Schedule for <span className="text-primary">{format(selectedDate, 'MMMM d')}</span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                        {format(selectedDate, 'eeee, yyyy')}
                    </CardDescription>
                  </div>
                  <Separator />
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {meetingsOnSelectedDate.length > 0 ? (
                      <ScrollArea className="flex-1 h-[355px]">
                        <ul className="space-y-2 p-6">
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
                                  <Link
                                    href={meeting.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="secondary" size="sm" className="w-full mt-2">
                                      Join Meeting
                                    </Button>
                                  </Link>
                                </CardContent>
                              </Card>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
                          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold">No Meetings</h3>
                          <p className="text-sm text-muted-foreground">
                            There are no meetings scheduled for this date.
                          </p>
                      </div>
                    )}
                  </CardContent>
                </div>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                   <FileText className="mr-3 h-5 w-5" />
                   Recent Summaries
                </CardTitle>
                 <CardDescription>A look at your last 5 summarized meetings.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTranscripts.length > 0 ? (
                  <ul className="space-y-4">
                    {recentTranscripts.map((meeting) => (
                      <li key={`recent-${meeting.id}`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-semibold">{meeting.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(parseISO(meeting.date), "PPP p")}
                                </p>
                            </div>
                            <Badge variant="outline">{meeting.platform}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No Recent Summaries</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Process a meeting transcript to see its summary here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
