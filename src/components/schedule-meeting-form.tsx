
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useMeetings } from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  platform: z.enum(['Google Meet', 'Zoom', 'Microsoft Teams']),
  link: z.string().url('Please enter a valid meeting URL.'),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm).'),
});

type FormValues = z.infer<typeof formSchema>;

interface ScheduleMeetingFormProps {
  onSuccess: () => void;
}

export function ScheduleMeetingForm({ onSuccess }: ScheduleMeetingFormProps) {
  const { addMeeting } = useMeetings();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      platform: 'Google Meet',
      link: '',
      date: new Date(),
      time: format(new Date(), 'HH:mm'),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    
    // Combine date and time
    const [hours, minutes] = values.time.split(':').map(Number);
    const meetingDateTime = new Date(values.date);
    meetingDateTime.setHours(hours, minutes, 0, 0);

    const meetingDetails = {
      title: values.title,
      platform: values.platform,
      date: meetingDateTime.toISOString(),
      link: values.link,
      meetingId: values.link, // Use link as a stand-in for ID for now
    };
    
    addMeeting(meetingDetails);
    
    toast({
       title: 'Meeting Scheduled!',
       description: `"${values.title}" has been added to your calendar.`,
     });

    setIsLoading(false);
    onSuccess();
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Project Standup" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
            <FormLabel>Platform</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select a meeting platform" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                <SelectItem value="Google Meet">Google Meet</SelectItem>
                <SelectItem value="Zoom">Zoom</SelectItem>
                <SelectItem value="Microsoft Teams">
                    Microsoft Teams
                </SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Link</FormLabel>
              <FormControl>
                <Input placeholder="https://meet.google.com/..." {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date('1900-01-01')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Schedule Meeting
        </Button>
      </form>
    </Form>
  );
}
