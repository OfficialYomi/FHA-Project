import React from 'react';

interface FormattedChatResponseProps {
  content: string;
}

/**
 * High-fidelity Markdown & Table Parser for Executive Yomi Assistant
 * Formats data cleanly into tables, bullet lists, bold text, badges, and callout sections.
 */
export default function FormattedChatResponse({ content }: FormattedChatResponseProps) {
  // Parse inline markdown: **bold**, `code`, *italics*
  const renderInline = (text: string) => {
    // Regex matching bold, code, italics
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 text-emerald-800 dark:text-emerald-300 rounded text-[11px] font-mono border border-slate-200 dark:border-white/10"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return (
          <em key={idx} className="italic text-slate-700 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Status Badge Formatter for table cells or lists
  const renderCellWithBadges = (cellText: string) => {
    const trimmed = cellText.trim();

    // Check if cell is a status keyword
    const lower = trimmed.toLowerCase();
    if (lower === 'delayed' || lower.includes('overdue') || lower.includes('⚠️ delayed')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
          {trimmed}
        </span>
      );
    }
    if (lower === 'needs attention' || lower.includes('attention')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
          {trimmed}
        </span>
      );
    }
    if (lower === 'on schedule' || lower === 'completed' || lower.includes('approved') || lower.includes('verified')) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
          {trimmed}
        </span>
      );
    }
    if (trimmed.startsWith('₦')) {
      return <span className="font-mono font-semibold">{renderInline(trimmed)}</span>;
    }

    return renderInline(trimmed);
  };

  // Helper to test if a block is a Markdown Table
  const isTableBlock = (lines: string[]): boolean => {
    if (lines.length < 2) return false;
    const hasPipes = lines.every(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
    // Second line should look like |---|---|
    const hasSeparator = lines.length >= 2 && /^\|[\s-:]+\|/.test(lines[1].trim());
    return hasPipes && hasSeparator;
  };

  // Render a parsed Markdown Table
  const renderTable = (tableLines: string[], key: number) => {
    const rawHeaders = tableLines[0]
      .split('|')
      .slice(1, -1)
      .map(h => h.trim());

    const bodyRows = tableLines.slice(2).map(line =>
      line
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim())
    );

    return (
      <div key={key} className="my-3 overflow-x-auto rounded-xl border border-slate-300 dark:border-white/10 shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-white/[0.06] border-b border-slate-300 dark:border-white/10 text-slate-800 dark:text-slate-200">
              {rawHeaders.map((header, hIdx) => (
                <th key={hIdx} className="py-2.5 px-3 font-bold text-[11px] uppercase tracking-wider">
                  {renderInline(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5">
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={
                  rIdx % 2 === 0
                    ? 'bg-white dark:bg-black/20 hover:bg-emerald-500/5 transition-colors'
                    : 'bg-slate-50/60 dark:bg-white/[0.02] hover:bg-emerald-500/5 transition-colors'
                }
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {renderCellWithBadges(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Break content into blocks: headers, tables, lists, and paragraphs
  const rawParagraphs = content.split('\n\n');

  return (
    <div className="space-y-2.5 text-xs leading-relaxed">
      {rawParagraphs.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        const lines = trimmed.split('\n');

        // 1. Table Detection
        if (isTableBlock(lines)) {
          return renderTable(lines, bIdx);
        }

        // 2. Check if the block has text mixed with table
        const firstPipeIndex = lines.findIndex(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
        if (firstPipeIndex > 0 && lines.length > firstPipeIndex + 1) {
          const preText = lines.slice(0, firstPipeIndex).join('\n');
          const tableLines = lines.slice(firstPipeIndex);
          if (isTableBlock(tableLines)) {
            return (
              <div key={bIdx} className="space-y-1.5">
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {renderInline(preText)}
                </p>
                {renderTable(tableLines, bIdx + 999)}
              </div>
            );
          }
        }

        // 3. Header Detection
        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={bIdx}
              className="font-bold text-slate-900 dark:text-white text-sm mt-3 mb-1.5 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1 font-serif"
            >
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-xs inline-block" />
              {renderInline(trimmed.replace('### ', ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={bIdx} className="font-semibold text-slate-900 dark:text-slate-100 text-xs mt-2 mb-1">
              {renderInline(trimmed.replace('#### ', ''))}
            </h5>
          );
        }

        // 4. Bullet / Numbered List Detection
        if (lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('• ') || /^\d+\.\s*/.test(l.trim()))) {
          return (
            <ul key={bIdx} className="space-y-1.5 my-1.5 pl-1">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                if (!lineTrimmed) return null;
                const isItem =
                  lineTrimmed.startsWith('- ') ||
                  lineTrimmed.startsWith('• ') ||
                  /^\d+\.\s*/.test(lineTrimmed);

                if (!isItem) {
                  return (
                    <li key={lIdx} className="text-slate-800 dark:text-slate-200 pl-4">
                      {renderInline(lineTrimmed)}
                    </li>
                  );
                }

                const cleanLine = lineTrimmed.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, '');
                return (
                  <li key={lIdx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className="flex-1">{renderInline(cleanLine)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // 5. Regular Paragraph
        return (
          <p key={bIdx} className="text-slate-800 dark:text-slate-200">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
