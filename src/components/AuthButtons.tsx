'use client';

import { useUser } from '@/firebase';
import { Button } from './ui/button';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import { Loader2, User as UserIcon, LogOut, HelpCircle, Flame, BookOpen, FlaskConical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AuthButtons() {
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (isUserLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  return (
    <>
      <Button asChild variant="ghost" className="hidden sm:flex">
        <Link href="/popular">
          <Flame className="mr-2 h-4 w-4 text-orange-500" />
          Populer
        </Link>
      </Button>
      <Button asChild variant="ghost" className="hidden md:flex">
        <Link href="/tutorial">
          <BookOpen className="mr-2 h-4 w-4" />
          Tutorial
        </Link>
      </Button>
      <Button asChild variant="ghost" className="hidden lg:flex">
        <Link href="/lab">
          <FlaskConical className="mr-2 h-4 w-4" />
          Lab Virtual
        </Link>
      </Button>
      <Button asChild variant="ghost" className="hidden xl:flex">
        <Link href="/help">Bantuan</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link href={user ? "/upload" : "/login"}>Unggah</Link>
      </Button>
      {user ? (
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-2">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback>
                    {(user.displayName?.charAt(0) || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName || 'Pengguna'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="sm:hidden">
              <Link href="/popular">
                <Flame className="mr-2 h-4 w-4" />
                <span>Populer</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="md:hidden">
              <Link href="/tutorial">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Tutorial</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="lg:hidden">
              <Link href="/lab">
                <FlaskConical className="mr-2 h-4 w-4" />
                <span>Lab Virtual</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Pusat Bantuan</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2 ml-2">
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Daftar</Link>
          </Button>
        </div>
      )}
    </>
  );
}