import React from "react";
import { MessageSquare } from "lucide-react";
import { useListDashboardMessages } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardMessages() {
  const { data: messages, isLoading } = useListDashboardMessages();
  const [selected, setSelected] = React.useState<number | null>(null);

  const selectedMessage = messages?.find(m => m.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Communications from your account management team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Message List */}
        <Card className="overflow-hidden flex flex-col">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>{messages?.filter(m => !m.read).length ?? 0} unread</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : messages && messages.length > 0 ? (
              <div>
                {messages.map(msg => (
                  <button
                    key={msg.id}
                    onClick={() => setSelected(msg.id)}
                    className={cn(
                      "w-full text-left p-4 border-b last:border-0 transition-colors hover:bg-muted/40",
                      selected === msg.id && "bg-primary/5 border-l-2 border-l-primary",
                      !msg.read && "bg-primary/3"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {msg.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn("text-sm", !msg.read ? "font-semibold" : "font-medium")}>{msg.senderName}</span>
                          {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className={cn("text-xs truncate", !msg.read ? "text-foreground font-medium" : "text-muted-foreground")}>{msg.subject}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{formatDate(msg.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-muted-foreground text-sm">No messages yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedMessage ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {selectedMessage.senderName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      From <span className="font-medium text-foreground">{selectedMessage.senderName}</span> · {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-y-auto">
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{selectedMessage.preview}</p>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold mb-1">Select a message</h3>
              <p className="text-sm text-muted-foreground">Choose a message from the inbox to read it here.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
