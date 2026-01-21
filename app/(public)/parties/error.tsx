'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Parties page error:', error);
    }, [error]);

    return (
        <div className="container-wide py-16 flex flex-col items-center justify-center text-center min-h-[50vh]">
            <div className="max-w-md space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">
                    Kaut kas nogāja greizi!
                </h2>
                <p className="text-muted-foreground">
                    Neizdevās ielādēt partiju sarakstu. Lūdzu, mēģiniet vēlreiz.
                </p>
                <div className="pt-4">
                    <Button onClick={reset} variant="default">
                        Mēģināt vēlreiz
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-destructive/10 text-destructive text-sm rounded-md text-left overflow-auto max-w-full">
                        <p className="font-mono font-bold mb-2">Error details:</p>
                        <pre className="whitespace-pre-wrap">{error.message}</pre>
                        {error.digest && <p className="mt-2 text-xs opacity-70">Digest: {error.digest}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
