
'use client';

import type { FC } from 'react';
import { Plus, LogOut, CalendarIcon, Users, Video } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAuth } from '@/hooks/use-auth';
import { AuthGuard } from '@/components/auth-guard';
import { useMeetings } from '@/hooks/use-meetings';
import { format, isToday } from 'date-fns';
import { ScheduleMeetingForm } from '@/components/schedule-meeting-form';
import { useState } from 'react';

const DashboardPage: FC = () => {
  const { user, signOut } = useAuth();
  const { meetings } = useMeetings();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const todaysMeetings = meetings.filter((meeting) =>
    isToday(new Date(meeting.date))
  );

  const getPlatformIcon = (platform: string) => {
    if (platform === 'Google Meet') return <Users className="h-4 w-4" />;
    if (platform === 'Zoom') return <Video className="h-4 w-4" />;
    if (platform === 'Microsoft Teams') return <Users className="h-4 w-4" />;
    return <Video className="h-4 w-4" />;
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
                <SidebarTrigger className="md:hidden" />
              </div>
            </div>

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Today's Meetings</CardTitle>
                    <CardDescription>
                      Here are your scheduled meetings for today,{' '}
                      {format(new Date(), 'PPP')}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {todaysMeetings.length > 0 ? (
                      <ul className="space-y-4">
                        {todaysMeetings.map((meeting) => (
                          <li
                            key={meeting.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="p-2 bg-primary/10 text-primary rounded-full">
                               {getPlatformIcon(meeting.platform)}
                            </div>
                            <div className="flex-grow">
                              <p className="font-semibold">{meeting.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(meeting.date), 'p')}
                              </p>
                            </div>
                            <Link
                              href={meeting.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm">
                                Join
                              </Button>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No meetings scheduled for today.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                 <Card>
                  <CardHeader>
                    <CardTitle>Google Calendar Sync</CardTitle>
                     <CardDescription>
                      Connect your Google Calendar to sync events.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      <svg
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 381.5 512 244 512 109.8 512 0 402.2 0 256S109.8 0 244 0c72.5 0 134.1 29.3 179.3 76.5l-64 64C291.1 112.3 269.1 96 244 96c-82.3 0-149.3 67-149.3 160s67 160 149.3 160c97.4 0 130.3-73.8 133.8-112.9H244v-75.3h236.4c4.7 25.8 7.6 54.3 7.6 84.7z"
                        ></path>
                      </svg>
                      Connect with Google (Coming Soon)
                    </Button>
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
