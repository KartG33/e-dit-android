export interface ParsedTag {
  id: string;
  structuralPart: string;
  styles: string[];
  originalString: string;
  count: number;
  isDeleted: boolean;
}

export function parseTags(text: string): ParsedTag[] {
  const regex = /\[([^\]]+)\]/g;
  let match;
  const tagsMap = new Map<string, ParsedTag>();
  const tagsOrder: string[] = [];

  while ((match = regex.exec(text)) !== null) {
    const originalString = match[0];
    const innerContent = match[1];
    const parts = innerContent.split('|').map(s => s.trim());
    const structuralPart = parts[0] || '';
    const styles = parts.slice(1).filter(Boolean);
    
    const key = `[${parts.join(' | ')}]`;

    if (tagsMap.has(key)) {
      tagsMap.get(key)!.count++;
    } else {
      tagsMap.set(key, {
        id: key,
        structuralPart,
        styles,
        originalString,
        count: 1,
        isDeleted: false
      });
      tagsOrder.push(key);
    }
  }

  return tagsOrder.map(key => tagsMap.get(key)!);
}

export function applyTags(originalText: string, tags: ParsedTag[]): { newText: string, updatedTags: ParsedTag[] } {
  let newText = originalText;
  const updatedTags = tags.map(tag => ({ ...tag }));
  
  for (const tag of updatedTags) {
    const newInner = tag.isDeleted || tag.styles.length === 0 
      ? tag.structuralPart 
      : `${tag.structuralPart} | ${tag.styles.join(' | ')}`;
    
    const newTagString = `[${newInner}]`;
    
    newText = newText.split(tag.originalString).join(newTagString);
    tag.originalString = newTagString;
  }
  
  return { newText, updatedTags };
}
