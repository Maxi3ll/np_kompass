'use client';

interface ProtocolViewProps {
  protocol: string;
  circleName?: string;
  meetingDate?: string;
}

export function ProtocolView({ protocol, circleName, meetingDate }: ProtocolViewProps) {
  // Simple markdown-to-HTML rendering for headings, bold, and lists
  const lines = protocol.split('\n');

  function handleDownload() {
    const blob = new Blob([protocol], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = meetingDate || new Date().toISOString().slice(0, 10);
    const nameStr = circleName?.replace(/\s+/g, '_') || 'Meeting';
    a.href = url;
    a.download = `Protokoll_${nameStr}_${dateStr}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">Protokoll</p>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          .md Download
        </button>
      </div>
      <div className="prose prose-sm max-w-none text-foreground">
        {lines.map((line, i) => {
          const trimmed = line.trim();

          if (!trimmed) return <div key={i} className="h-2" />;

          // H1
          if (trimmed.startsWith('# ')) {
            return (
              <h2 key={i} className="text-lg font-bold text-foreground mt-4 mb-2 first:mt-0">
                {renderInline(trimmed.slice(2))}
              </h2>
            );
          }

          // H2
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-1">
                {renderInline(trimmed.slice(3))}
              </h3>
            );
          }

          // H3
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={i} className="text-sm font-semibold text-foreground mt-3 mb-1">
                {renderInline(trimmed.slice(4))}
              </h4>
            );
          }

          // List item
          if (trimmed.startsWith('- ')) {
            return (
              <div key={i} className="flex items-start gap-2 pl-2 py-0.5">
                <span className="text-muted-foreground mt-1.5">{'·'}</span>
                <span className="text-sm">{renderInline(trimmed.slice(2))}</span>
              </div>
            );
          }

          // Regular paragraph
          return (
            <p key={i} className="text-sm leading-relaxed">
              {renderInline(trimmed)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Simple bold parsing: **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
