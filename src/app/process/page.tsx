
'use client';

import { useState, useRef } from 'react';
import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Loader2,
  ListTodo,
  KeyRound,
  Bot,
  FileText,
  Clipboard,
  Printer,
  ChevronRight,
  ChevronLeft,
  Upload,
} from 'lucide-react';

import {
  extractActionItems,
  type ExtractActionItemsOutput,
} from '@/ai/flows/extract-action-items';
import {
  extractKeyDecisions,
  type ExtractKeyDecisionsOutput,
} from '@/ai/flows/extract-key-decisions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

type PrintableViewProps = {
  actionItems: ExtractActionItemsOutput | null;
  keyDecisions: ExtractKeyDecisionsOutput | null;
};

const PrintableView: FC<PrintableViewProps> = ({ actionItems, keyDecisions }) => {
  if (!actionItems && !keyDecisions) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold">No content to print.</h1>
        <p className="text-muted-foreground">
          Please generate meeting minutes first.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white text-black">
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">MeetFlow</h1>
      </div>
      <p className="text-gray-500 mb-8">Generated Meeting Minutes</p>

      {keyDecisions && (
        <section className="mb-8 break-inside-avoid">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">
            Key Decisions
          </h2>
          <p className="italic text-gray-700 mb-4">{keyDecisions.summary}</p>
          <ul className="space-y-2 list-disc pl-5">
            {keyDecisions.keyDecisions.map((d, i) => (
              <li key={`p-d-${i}`}>{d}</li>
            ))}
          </ul>
        </section>
      )}

      {actionItems && actionItems.length > 0 && (
        <section className="break-inside-avoid">
          <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">
            Action Items
          </h2>
          <div className="space-y-4">
            {actionItems.map((item, i) => (
              <div
                key={`p-a-${i}`}
                className="border-l-4 border-blue-600 pl-4 py-2 break-inside-avoid-page"
              >
                <p className="font-semibold">{item.actionItem}</p>
                <p className="text-sm text-gray-600">
                  <strong>Assignee:</strong> {item.assignee} |{' '}
                  <strong>Deadline:</strong>{' '}
                  {format(new Date(item.deadline), 'PP')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default function ProcessTranscriptPage() {
  const [transcript, setTranscript] = useState('');
  const [actionItems, setActionItems] =
    useState<ExtractActionItemsOutput | null>(null);
  const [keyDecisions, setKeyDecisions] =
    useState<ExtractKeyDecisionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setTranscript(text);
       toast({
        title: 'File Uploaded',
        description: `${file.name} has been loaded into the text area.`,
      });
    };
    reader.onerror = () => {
      toast({
        title: 'File Read Error',
        description: 'Could not read the selected file.',
        variant: 'destructive',
      });
    };
    reader.readAsText(file);
  };

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: 'No transcript provided',
        description: 'Please paste or upload a transcript to proceed.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setActionItems(null);
    setKeyDecisions(null);

    try {
      const [actionItemsResult, keyDecisionsResult] = await Promise.all([
        extractActionItems({ transcript }),
        extractKeyDecisions({ transcript }),
      ]);

      setActionItems(actionItemsResult);
      setKeyDecisions(keyDecisionsResult);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Processing Transcript',
        description:
          'An unexpected error occurred. The AI model may have returned an invalid response. Please try again or adjust your transcript.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!actionItems && !keyDecisions) {
      toast({
        title: 'Nothing to copy',
        description: 'Generate minutes first.',
        variant: 'destructive',
      });
      return;
    }

    let textToCopy = 'MEETING MINUTES - Generated by MeetFlow\n\n';

    if (keyDecisions) {
      textToCopy += '--- KEY DECISIONS ---\n';
      textToCopy += `Summary: ${keyDecisions.summary}\n\n`;
      keyDecisions.keyDecisions.forEach((d) => {
        textToCopy += `- ${d}\n`;
      });
      textToCopy += '\n\n';
    }

    if (actionItems && actionItems.length > 0) {
      textToCopy += '--- ACTION ITEMS ---\n';
      actionItems.forEach((item) => {
        textToCopy += `Task: ${item.actionItem}\n`;
        textToCopy += `Assignee: ${item.assignee}\n`;
        try {
          textToCopy += `Deadline: ${format(new Date(item.deadline), 'PP')}\n\n`;
        } catch {
          textToCopy += `Deadline: Invalid Date\n\n`;
        }
      });
    }

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast({ title: 'Copied to clipboard!' });
      },
      (err) => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy text to clipboard.',
          variant: 'destructive',
        });
        console.error('Could not copy text: ', err);
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex flex-col no-print">
        <header className="flex items-center justify-between p-4 border-b shrink-0">
          <Link href="/" passHref>
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Clipboard className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </header>

        <main className="flex-grow p-4 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
            <Card className="lg:sticky top-8 self-start shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText /> Meeting Transcript
                  </div>
                   <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".txt,.vtt,.srt,.text"
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </CardTitle>
                <CardDescription>
                  Paste your meeting transcript below or upload a file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste your meeting transcript here..."
                  className="h-64"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
                <Button
                  className="w-full mt-4"
                  onClick={handleProcessTranscript}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Generate Minutes
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {isLoading && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              )}

              {!isLoading && !actionItems && !keyDecisions && (
                <Card className="flex flex-col items-center justify-center min-h-[400px] text-center shadow-lg">
                  <CardContent className="p-8">
                    <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                      <Bot className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">
                      Your meeting summary will appear here
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      Just paste your transcript and click "Generate Minutes" to
                      see the AI-powered summary, key decisions, and action items.
                    </p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && (actionItems || keyDecisions) && (
                <Tabs defaultValue="action-items" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="action-items">
                      <ListTodo className="mr-2 h-4 w-4" />
                      Action Items
                    </TabsTrigger>
                    <TabsTrigger value="key-decisions">
                      <KeyRound className="mr-2 h-4 w-4" />
                      Key Decisions
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="action-items">
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle>Action Items</CardTitle>
                        <CardDescription>
                          Tasks assigned during the meeting with assignees and
                          deadlines.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {actionItems && actionItems.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[50%]">Task</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Deadline</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {actionItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">
                                    {item.actionItem}
                                  </TableCell>
                                  <TableCell>{item.assignee}</TableCell>
                                  <TableCell>
                                    {format(new Date(item.deadline), 'PP')}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No action items were detected.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="key-decisions">
                    <Card className="shadow-lg">
                      <CardHeader>
                        <CardTitle>Key Decisions</CardTitle>
                        <CardDescription>
                          {keyDecisions?.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {keyDecisions &&
                        keyDecisions.keyDecisions.length > 0 ? (
                          <ul className="space-y-4">
                            {keyDecisions.keyDecisions.map(
                              (decision, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <span className="text-accent mt-1">
                                    <ChevronRight className="h-5 w-5" />
                                  </span>
                                  <span className="flex-1">{decision}</span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No key decisions were detected.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>
      </div>
      <div className="hidden printable-area">
        <PrintableView actionItems={actionItems} keyDecisions={keyDecisions} />
      </div>
    </>
  );
}
