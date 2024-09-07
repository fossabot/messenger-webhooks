import LogoIcon from '@/app/favicon.ico';
import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';
import Image from 'next/image';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: HomeLayoutProps = {
    nav: {
        title: (
            <div className="flex items-center gap-2">
                <Image src={LogoIcon} alt="Messenger Webhooks" width={24} height={24} />
                <span className="font-semibold">Messenger Webhooks</span>
            </div>
        ),
    },
};
