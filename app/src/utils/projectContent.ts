import DOMPurify from 'dompurify';

export const cleanProjectText = (value = '') => {
  const decoded = value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"');

  return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

export const sanitizeProjectHtml = (value = '') => {
  const decoded = value.replace(/&nbsp;/gi, ' ');
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(decoded);

  if (!looksLikeHtml) {
    return decoded.replace(/\r\n/g, '\n').replace(/\n/g, '<br />');
  }

  return DOMPurify.sanitize(decoded, {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });
};
