
'use client';

import type { FC } from 'react';
import { Plus, LogOut, CalendarIcon, Users, Video, Clock } from 'lucide-react';
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
import { format, isToday, parseISO } from 'date-fns';
import { ScheduleMeetingForm } from '@/components/schedule-meeting-form';
import { useState } from 'react';

const StatCard: FC<{ title: string; value: string | number, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const DashboardPage: FC = () => {
  const { user, signOut } = useAuth();
  const { meetings } = useMeetings();
  const [isDialogOpen, setDialogOpen] = useState(false);

  const todaysMeetings = meetings.filter((meeting) =>
    isToday(parseISO(meeting.date))
  );

  const getPlatformIcon = (platform: string, className="h-4 w-4") => {
    if (platform === 'Google Meet') return <Users className={className} />;
    if (platform === 'Zoom') return <Video className={className} />;
    if (platform === 'Microsoft Teams') return <Users className={className} />;
    return <Video className={className} />;
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
                <Link href="/">
                  <SidebarMenuButton isActive>
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/calendar">
                  <SidebarMenuButton>
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

            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
              <StatCard title="Meetings Today" value={todaysMeetings.length} icon={<CalendarIcon />} />
              <StatCard title="Total Meetings" value={meetings.length} icon={<Users />} />
              <StatCard title="Platforms Used" value="3" icon={<Video />} />
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
                          <li key={meeting.id}>
                            <Card className="hover:border-primary/50 transition-colors">
                              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                   {getPlatformIcon(meeting.platform, "h-6 w-6")}
                                </div>
                                <div className="flex-grow">
                                  <p className="font-semibold">{meeting.title}</p>
                                  <p className="text-sm text-muted-foreground flex items-center mt-1">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    {format(parseISO(meeting.date), 'p')}
                                    <span className="mx-2 text-muted-foreground/50">|</span>
                                    {getPlatformIcon(meeting.platform, "h-4 w-4 mr-1.5")}
                                    {meeting.platform}
                                  </p>
                                </div>
                                <Link
                                  href={meeting.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" className="w-full sm:w-auto">
                                    Join
                                  </Button>
                                </Link>
                              </CardContent>
                            </Card>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No meetings today</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Enjoy your day or schedule a new meeting.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                 <Card>
                  <CardHeader>
                    <CardTitle>Google Calendar Sync</CardTitle>
                     <CardDescription>
                      Connect your Google Calendar to automatically sync events.
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
