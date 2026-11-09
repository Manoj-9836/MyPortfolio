import DOMPurify from 'dompurify';
import { ChevronDown, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface PostDisplayProps {
  content: string;
}

interface TocEntry {
  id: string;
  label: string;
  level: number;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';

const trimBlockLeadingWhitespace = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node as Text);
    node = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    textNode.nodeValue = textNode.nodeValue?.replace(/\u00a0/g, ' ') || '';
  });

  root.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote').forEach((block) => {
    const firstTextNode = document.createTreeWalker(block, NodeFilter.SHOW_TEXT).nextNode() as Text | null;
    if (firstTextNode) {
      firstTextNode.nodeValue = firstTextNode.nodeValue?.replace(/^\s+/, '') || '';
    }
  });

  root.querySelectorAll<HTMLElement>('*').forEach((element) => {
    element.style.removeProperty('white-space');
  });
};

const prepareContent = (content: string) => {
  const sanitizedContent = DOMPurify.sanitize(content || '', {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: [
      'style',
      'class',
      'id',
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'data-*',
    ],
    ALLOW_DATA_ATTR: true,
  });

  if (typeof window === 'undefined') {
    return { html: sanitizedContent, entries: [] as TocEntry[] };
  }

  const documentFragment = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  const usedIds = new Set<string>();
  const entries: TocEntry[] = [];

  documentFragment.querySelectorAll('p').forEach((paragraph) => {
    const text = paragraph.textContent?.trim() || '';
    const hasOnlyStrongText =
      text.length > 0 &&
      text.length <= 120 &&
      paragraph.children.length === 1 &&
      ['STRONG', 'B'].includes(paragraph.firstElementChild?.tagName || '') &&
      paragraph.firstElementChild?.textContent?.trim() === text;

    if (hasOnlyStrongText) {
      const heading = documentFragment.createElement('h2');
      heading.innerHTML = paragraph.innerHTML;
      paragraph.replaceWith(heading);
    }
  });

  trimBlockLeadingWhitespace(documentFragment.body);

  documentFragment.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const label = heading.textContent?.trim() || '';
    if (!label) return;

    const existingId = heading.getAttribute('id');
    const baseId = existingId || slugify(label);
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    usedIds.add(id);
    heading.id = id;
    entries.push({
      id,
      label,
      level: Number(heading.tagName.substring(1)),
    });
  });

  return {
    html: documentFragment.body.innerHTML,
    entries,
  };
};

export default function PostDisplay({ content }: PostDisplayProps) {
  const preparedContent = useMemo(() => prepareContent(content), [content]);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [activeId, setActiveId] = useState(preparedContent.entries[0]?.id || '');

  useEffect(() => {
    if (!preparedContent.entries.length) return;

    const headings = preparedContent.entries
      .map(({ id }) => document.getElementById(id))
      .filter((heading): heading is HTMLElement => Boolean(heading));

    const observer = new IntersectionObserver(
      (observations) => {
        const visibleHeading = observations
          .filter((observation) => observation.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleHeading) setActiveId(visibleHeading.target.id);
      },
      { rootMargin: '-18% 0px -65% 0px', threshold: [0, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [preparedContent.entries]);

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  };

  return (
    <div className="mx-auto w-full max-w-[800px]">
      {preparedContent.entries.length > 0 && (
        <nav className="mb-8 rounded-lg border border-[#F3EEE3]/25 bg-[#111111] p-4 sm:p-5" aria-label="Table of contents">
          <button
            type="button"
            onClick={() => setIsTocOpen((open) => !open)}
            aria-expanded={isTocOpen}
            className="flex min-h-11 w-full items-center justify-between gap-4 text-left text-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
          >
            <span className="flex items-center gap-3 font-display text-lg font-semibold">
              <List className="h-5 w-5 text-[#D9541E]" />
              Table of Contents
            </span>
            <ChevronDown className={`h-5 w-5 text-[#D9541E] transition-transform ${isTocOpen ? 'rotate-180' : ''}`} />
          </button>

          {isTocOpen && (
            <div className="mt-4 grid gap-x-8 border-t border-[#F3EEE3]/15 pt-3 sm:grid-cols-2">
              {preparedContent.entries.map((entry, index) => (
                <button
                  type="button"
                  key={entry.id}
                  onClick={() => scrollToHeading(entry.id)}
                  className={`flex min-h-11 items-center gap-3 border-b border-[#F3EEE3]/15 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E] ${
                    activeId === entry.id ? 'text-[#F3EEE3]' : 'text-[#F3EEE3]/65 hover:text-[#F3EEE3]'
                  }`}
                  style={{ paddingLeft: `${Math.max(0, entry.level - 1) * 0.5}rem` }}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    activeId === entry.id ? 'bg-[#D9541E] text-[#111111]' : 'bg-[#D9541E]/20 text-[#D9541E]'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{entry.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
      )}

      <div
        className="post-display min-w-0 w-full overflow-hidden font-sans text-[15px] leading-[1.8] text-[#F3EEE3]/85 sm:text-base"
        dangerouslySetInnerHTML={{ __html: preparedContent.html }}
      />
    </div>
  );
}