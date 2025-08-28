
'use client';

import type { FC } from 'react';
import { Plus } from 'lucide-react';
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
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

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
        <SidebarContent />
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardPage;
