'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth, useUser, initiateEmailSignIn, initiateGoogleSignIn } from '@/firebase';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Alamat email tidak valid.'),
  password: z.string().min(6, 'Kata sandi minimal harus 6 karakter.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Google Icon SVG component
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      <path d="M1 1h22v22H1z" fill="none"/>
    </svg>
  );

export default function LoginPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const onLoginSuccess = () => {
    toast({
      title: 'Login Berhasil!',
      description: 'Selamat datang kembali!',
    });
    // The useEffect will handle the redirect.
  };

  const onLoginError = (error: any) => {
    toast({
      variant: 'destructive',
      title: 'Login Gagal',
      description: error.code === 'auth/invalid-credential' 
        ? 'Email atau kata sandi salah.'
        : error.message || 'Terjadi kesalahan yang tidak diketahui.',
    });
    setIsLoading(false);
    setIsGoogleLoading(false);
  };

  const onEmailSubmit = (data: LoginFormValues) => {
    if (!auth) return;
    setIsLoading(true);
    initiateEmailSignIn(auth, data.email, data.password, onLoginSuccess, onLoginError);
  };

  const handleGoogleSignIn = () => {
    if (!auth) return;
    setIsGoogleLoading(true);
    initiateGoogleSignIn(auth, onLoginSuccess, onLoginError);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-250px)] animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <LogIn className="h-6 w-6" />
            Login ke MAIN Q
          </CardTitle>
          <CardDescription>
            Masuk ke akun Anda untuk mengelola dan membuat game.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onEmailSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="guru@sekolah.com"
                {...register('email')}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading || isGoogleLoading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Masuk dengan Email'}
            </Button>
          </CardFooter>
        </form>
        
        <div className="relative mb-4 px-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                Atau lanjutkan dengan
                </span>
            </div>
        </div>

        <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading || isGoogleLoading}>
                {isGoogleLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                )}
                Masuk dengan Google
            </Button>
            <p className="text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
          </CardFooter>
      </Card>
    </div>
  );
}
