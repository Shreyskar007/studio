
'use client';

import type { FC } from 'react';
import { useState } from 'react';
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
import { isSameDay, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const CalendarPage: FC = () => {
  const { signOut } = useAuth();
  const { meetings } = useMeetings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const meetingDates = meetings.map((meeting) => new Date(meeting.date));

  const meetingsForSelectedDay = meetings.filter((meeting) => 
    selectedDate && isSameDay(new Date(meeting.date), selectedDate)
  );

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
                 <CardContent className="p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      modifiers={{
                        hasMeeting: meetingDates,
                      }}
                      modifiersClassNames={{
                        hasMeeting: 'bg-primary/20',
                      }}
                      className="p-0"
                      classNames={{
                        months: 'flex flex-col sm:flex-row',
                        month: 'space-y-4 p-4 sm:p-6',
                        caption: 'flex justify-center pt-1 relative items-center',
                        table: 'w-full border-collapse space-y-1',
                        head_row: 'flex',
                        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                        row: 'flex w-full mt-2',
                        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                        day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                        day_today: 'bg-accent text-accent-foreground',
                        day_outside: 'text-muted-foreground opacity-50',
                        day_disabled: 'text-muted-foreground opacity-50',
                        day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
                      }}
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
                              <TableCell>{format(new Date(meeting.date), 'p')}</TableCell>
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
