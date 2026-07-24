const STOP_WORDS = new Set([
  'that',
  'this',
  'with',
  'from',
  'have',
  'will',
  'your',
  'about',
  'into',
  'than',
  'then',
  'them',
  'they',
  'were',
  'been',
  'being',
  'because',
  'which',
  'while',
  'where',
  'when',
  'what',
  'there',
  'their',
  'would',
  'could',
  'should',
  'shall',
  'also',
  'just',
  'like',
  'only',
  'over',
  'such',
  'some',
  'more',
  'most',
  'other',
  'after',
  'before',
  'under',
  'again',
  'further',
  'once',
  'here',
  'both',
  'each',
  'few',
  'same',
  'too',
  'very',
  'can',
  'does',
  'doing',
  'done',
  'make',
  'made',
  'need',
  'needs',
  'want',
  'wants',
  'please',
  'project',
  'request',
  'scope',
  'item',
  'items',
  'work',
  'page',
  'pages',
]);

function extractSignificantWords(text) {
  if (!text || typeof text !== 'string') {
    return new Set();
  }

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))
  );
}

function sharesSignificantWord(requestText, scopeItems) {
  const requestWords = extractSignificantWords(requestText);

  for (const item of scopeItems) {
    const scopeWords = extractSignificantWords(
      `${item.title || ''} ${item.description || ''}`
    );
    for (const word of requestWords) {
      if (scopeWords.has(word)) {
        return true;
      }
    }
  }

  return false;
}

export function classifyRequest(requestText, categoryTag, scopeItems) {
  const items = Array.isArray(scopeItems) ? scopeItems : [];
  const tag =
    typeof categoryTag === 'string' && categoryTag.trim()
      ? categoryTag.trim().toLowerCase()
      : null;

  if (tag) {
    const tagMatch = items.some(
      (item) => String(item.categoryTag || '').toLowerCase() === tag
    );
    return tagMatch ? 'in_scope' : 'unclear';
  }

  if (sharesSignificantWord(requestText, items)) {
    return 'unclear';
  }

  return 'possible_extra';
}
