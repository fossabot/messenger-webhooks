import type { ReactNode } from 'react';

import { RootProvider } from 'fumadocs-ui/provider';
import { Glory, Source_Code_Pro } from 'next/font/google';

import './global.css';

const inter = Glory({ subsets: ['latin'], variable: '--font-sans' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-mono' });

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${sourceCodePro.variable}`}
            suppressHydrationWarning
        >
            <body>
                <RootProvider>{children}</RootProvider>
            </body>
        </html>
    );
}
