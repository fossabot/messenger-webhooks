import type { Metadata } from 'next';

import { source } from '@/app/source';
import { getGithubLastEdit } from 'fumadocs-core/server';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { getImageMeta } from 'fumadocs-ui/og';
import { DocsPage, DocsBody, DocsDescription, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: { slug?: string[] } }) {
    const page = source.getPage(params.slug);
    if (!page) notFound();

    const MDX = page.data.body;

    const github = {
        owner: 'pyyupsk',
        repo: 'messenger-webhooks',
        sha: 'main',
        path: `apps/docs/content/docs/${page.file.path}`,
    };

    const lastUpdate = await getGithubLastEdit(github);

    return (
        <DocsPage
            toc={page.data.toc}
            full={page.data.full}
            lastUpdate={lastUpdate ?? undefined}
            editOnGithub={github}
        >
            <DocsTitle>{page.data.title}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <DocsBody>
                <MDX components={{ ...defaultMdxComponents }} />
            </DocsBody>
        </DocsPage>
    );
}

export async function generateStaticParams() {
    return source.generateParams();
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
    const page = source.getPage(params.slug);
    if (!page) notFound();

    const image = getImageMeta('og', page.slugs);

    return {
        title: page.data.title,
        description: page.data.description,
        metadataBase: new URL('https://messenger-webhooks.vercel.app'),
        openGraph: {
            images: image,
        },
        twitter: {
            images: image,
            card: 'summary_large_image',
        },
    } satisfies Metadata;
}
