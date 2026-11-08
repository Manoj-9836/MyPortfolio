import DOMPurify from 'dompurify';

interface PostDisplayProps {
  content: string;
}

export default function PostDisplay({ content }: PostDisplayProps) {
  const sanitizedContent = DOMPurify.sanitize(content || '', {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height', 'data-*'],
    ALLOW_DATA_ATTR: true,
  });

  return (
    <div
      className="post-display min-w-0 max-w-full break-words font-serif text-sm leading-7 text-[#F3EEE3]/75 md:text-base"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}