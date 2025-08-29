
'use client';

import { useState } from 'react';
import {
  isSameDay,
  isSameMonth,
  format,
  parseISO,
} from 'date-fns';
import { CalendarIcon, ChevronRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMeetings } from '@/hooks/use-meetings';
import { AuthGuard } from '@/components/auth-guard';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

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
           <h1 className="text-3xl font-bold mb-8">Calendar</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-2">
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
                className="p-3"
              />
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
                 <CardDescription>
                  {meetingsOnSelectedDate.length} meeting(s) scheduled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meetingsOnSelectedDate.length > 0 ? (
                  <ul className="space-y-4">
                    {meetingsOnSelectedDate.map((meeting) => (
                      <li key={meeting.id}>
                        <h4 className="font-semibold">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(meeting.date), 'p')} on {meeting.platform}
                        </p>
                         <p className="text-sm mt-2 p-3 bg-muted rounded-md">{meeting.summary}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No meetings on this date.
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
}
