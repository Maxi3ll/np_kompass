'use client';

interface ProtocolViewProps {
  protocol: string;
}

export function ProtocolView({ protocol }: ProtocolViewProps) {
  // Simple markdown-to-HTML rendering for headings, bold, and lists
  const lines = protocol.split('\n');

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border/50 p-4">
      <p className="text-xs text-muted-foreground mb-3">Protokoll</p>
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
