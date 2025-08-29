
'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Calendar } from '@/components/ui/calendar';
import { AuthGuard } from '@/components/auth-guard';
import { useAuth } from '@/hooks/use-auth';
import { useMeetings } from '@/hooks/use-meetings';
import { isSameDay, format, parseISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CalendarPage: FC = () => {
  const { signOut } = useAuth();
  const { meetings } = useMeetings();
  
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [displayedMonth, setDisplayedMonth] = useState<Date>(today);

  // Memoize meeting dates to avoid re-calculating on every render
  const meetingDates = useMemo(() => meetings.map((meeting) => parseISO(meeting.date)), [meetings]);

  const meetingsForSelectedDay = useMemo(() => {
    return meetings.filter((meeting) => 
      selectedDate && isSameDay(parseISO(meeting.date), selectedDate)
    );
  }, [meetings, selectedDate]);

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
                <SidebarMenuButton href="/">
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/calendar" isActive>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Calendar
                </SidebarMenuButton>
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold">My Calendar</h1>
                <p className="text-muted-foreground">
                  View and manage your scheduled meetings.
                </p>
              </div>
              <SidebarTrigger className="md:hidden" />
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 items-start">
               <Card className="shadow-sm">
                 <CardContent className="p-0 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      month={displayedMonth}
                      onMonthChange={setDisplayedMonth}
                      modifiers={{
                        hasMeeting: meetingDates,
                      }}
                      modifiersClassNames={{
                        hasMeeting: 'bg-primary/20 !text-primary-foreground font-bold',
                      }}
                      className="p-0"
                    />
                 </CardContent>
               </Card>
               
               <Card>
                  <CardHeader>
                    <CardTitle>
                      Meetings for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </CardTitle>
                    <CardDescription>
                      Here are the meetings scheduled for the selected day.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {meetingsForSelectedDay.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Platform</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {meetingsForSelectedDay.map((meeting) => (
                            <TableRow key={meeting.id}>
                              <TableCell className="font-medium">
                                {meeting.title}
                              </TableCell>
                              <TableCell>{format(parseISO(meeting.date), 'p')}</TableCell>
                              <TableCell>{meeting.platform}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No meetings scheduled for this day.
                      </p>
                    )}
                  </CardContent>
               </Card>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default CalendarPage;
