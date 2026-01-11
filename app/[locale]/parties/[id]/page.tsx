"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PartyDetail() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/parties');
    }, [router]);

    return null;
}
