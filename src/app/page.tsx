
'use client';

import type { FC } from 'react';
import { Plus, Video, Calendar, LogOut } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

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
  return (
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
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <Link href="/login">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                An overview of your meetings and action items.
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
                  <CardTitle>My Calendar</CardTitle>
                  <CardDescription>
                    Your upcoming meetings at a glance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Schedule a Meeting</CardTitle>
                  <CardDescription>
                    Create a new meeting on your favorite platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Schedule on Google Meet
                  </Button>
                  <Button variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Schedule on Zoom
                  </Button>
                  <Button variant="outline">
                    <Video className="mr-2 h-4 w-4" />
                    Schedule on Teams
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardPage;
