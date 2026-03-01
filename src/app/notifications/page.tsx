
'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, writeBatch, limit } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bell, CheckCheck, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  senderName: string;
  contentTitle: string;
  contentLink: string;
  type: string;
  read: boolean;
  createdAt: any;
  userId: string;
}

export default function NotificationsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const notifQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      limit(50)
    );
  }, [firestore, user]);

  const { data: notifications, isLoading } = useCollection<Notification>(notifQuery);

  const sortedNotifications = (notifications || []).sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeB - timeA;
  });

  const markAllRead = async () => {
    if (!firestore || !notifications) return;
    const batch = writeBatch(firestore);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(firestore, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const markReadAndGo = (notif: Notification) => {
    if (firestore && !notif.read) {
      updateDocumentNonBlocking(doc(firestore, 'notifications', notif.id), { read: true });
    }
    router.push(notif.contentLink);
  };

  if (isUserLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Bell className="text-primary" />
            Notifikasi
          </h1>
          <p className="text-muted-foreground">Interaksi terbaru pada konten Anda.</p>
        </div>
        {notifications && notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Tandai Semua Terbaca
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : sortedNotifications.length > 0 ? (
          sortedNotifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'bg-card'}`}
              onClick={() => markReadAndGo(n)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-full ${!n.read ? 'bg-primary/20' : 'bg-muted'}`}>
                  <MessageCircle className={`h-5 w-5 ${!n.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-bold">{n.senderName}</span> mengomentari konten Anda: <span className="font-semibold text-primary">"{n.contentTitle}"</span>
                  </p>
                  <span className="text-xs text-muted-foreground block mt-1">
                    {n.createdAt?.toDate ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: idLocale }) : 'Baru saja'}
                  </span>
                </div>
                {!n.read && <div className="h-2 w-2 bg-primary rounded-full mt-2"></div>}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-20" />
            <p className="text-muted-foreground">Belum ada kabar baru.</p>
          </div>
        )}
      </div>
    </div>
  );
}
