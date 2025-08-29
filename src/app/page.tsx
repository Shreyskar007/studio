
'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Plus, Video, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMeetings } from '@/hooks/use-meetings';
import { parseISO, format } from 'date-fns';

const DashboardPage: FC = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { meetings, addMeeting } = useMeetings();
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingPlatform, setNewMeetingPlatform] = useState('Google Meet');

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle || !newMeetingDate || !newMeetingTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields to schedule a meeting.',
        variant: 'destructive',
      });
      return;
    }
    
    // Combine date and time and ensure it's a valid ISO string
    const meetingDateTime = new Date(`${newMeetingDate}T${newMeetingTime}`).toISOString();

    const newMeeting = {
      id: `M${String(meetings.length + 1).padStart(3, '0')}`,
      title: newMeetingTitle,
      date: meetingDateTime,
      platform: newMeetingPlatform,
      status: 'Scheduled',
    };

    addMeeting(newMeeting);

    // Reset form
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewMeetingTime('');
    setNewMeetingPlatform('Google Meet');

    toast({
      title: 'Meeting Scheduled!',
      description: `${newMeeting.title} has been added to your meetings.`,
    });
  };


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
                <SidebarMenuButton href="/" isActive>
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton href="/calendar">
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
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.displayName || user?.email}!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/process" passHref>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Meeting from Transcript
                  </Button>
                </Link>
                <SidebarTrigger className="md:hidden" />
              </div>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Meetings</CardTitle>
                    <CardDescription>
                      Here are the meetings you've recently processed or scheduled.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>
                            <span className="sr-only">Actions</span>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {meetings.map((meeting) => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">
                              {meeting.title}
                            </TableCell>
                            <TableCell>{format(parseISO(meeting.date), 'PP')}</TableCell>
                            <TableCell>{meeting.platform}</TableCell>
                            <TableCell>
                              <Badge variant={meeting.status === 'Completed' ? 'outline' : 'default'}>
                                {meeting.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                View Summary
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule a Meeting</CardTitle>
                    <CardDescription>
                      Create a new meeting and invite participants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleScheduleMeeting} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input 
                          id="title" 
                          placeholder="e.g. Q4 Planning"
                          value={newMeetingTitle}
                          onChange={(e) => setNewMeetingTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input 
                            id="date" 
                            type="date"
                            value={newMeetingDate}
                            onChange={(e) => setNewMeetingDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input 
                            id="time" 
                            type="time"
                            value={newMeetingTime}
                            onChange={(e) => setNewMeetingTime(e.target.value)}
                           />
                        </div>
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <Select value={newMeetingPlatform} onValueChange={setNewMeetingPlatform}>
                          <SelectTrigger id="platform">
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Google Meet">Google Meet</SelectItem>
                            <SelectItem value="Zoom">Zoom</SelectItem>
                            <SelectItem value="Teams">Microsoft Teams</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full">
                        <Video className="mr-2 h-4 w-4" />
                        Schedule Meeting
                      </Button>
                    </form>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>My Calendar</CardTitle>
                    <CardDescription>
                      Your upcoming meetings at a glance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={new Date()}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default DashboardPage;
