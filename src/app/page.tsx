
'use client';

import type { FC } from 'react';
import { Plus, LogOut } from 'lucide-react';
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

            <div className="grid gap-8 grid-cols-1">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome to MeetFlow</CardTitle>
                  <CardDescription>
                    Get started by processing a meeting transcript.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    You can process a new meeting by clicking the button above.
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default DashboardPage;
