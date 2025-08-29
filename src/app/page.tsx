
'use client';

import type { FC } from 'react';
import { Plus, Video, Calendar as CalendarIcon, LogOut, Clock, Type } from 'lucide-react';
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

const meetings = [
  {
    id: 'M001',
    title: 'Q3 Project Kickoff',
    date: '2023-10-26',
    platform: 'Google Meet',
    status: 'Completed',
  },
  {
    id: 'M002',
    title: 'Marketing Sync',
    date: '2023-10-25',
    platform: 'Zoom',
    status: 'Completed',
  },
  {
    id: 'M003',
    title: 'Sprint Planning',
    date: '2023-10-24',
    platform: 'Teams',
    status: 'Completed',
  },
  {
    id: 'M004',
    title: 'Client Demo Prep',
    date: '2023-10-23',
    platform: 'Google Meet',
    status: 'Completed',
  },
];

const DashboardPage: FC = () => {
  const { user, signOut } = useAuth();

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
                      Here are the meetings you've recently processed.
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
                            <TableCell>{meeting.date}</TableCell>
                            <TableCell>{meeting.platform}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{meeting.status}</Badge>
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
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="e.g. Q4 Planning" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input id="time" type="time" />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <Select>
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmeet">Google Meet</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="teams">Microsoft Teams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      <Video className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
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
