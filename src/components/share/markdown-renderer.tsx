import React from "react";

// Simple inline parser for **bold** text
const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} style={{ color: '#000' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

interface Props {
    content: string;
}

export const MarkdownRenderer = ({ content }: Props) => {
    if (!content) return null;
    
    // Preprocess: remove empty lines that are sandwiched between table lines
    const processedLines: string[] = [];
    const rawLines = content.split('\n');
    
    const isTableLineRaw = (idx: number) => {
        const trimmed = rawLines[idx]?.trim() || '';
        if (!trimmed.includes('|')) return false;
        if (trimmed.startsWith('|')) return true;
        // Check if neighbors contain '|'
        let hasNeighbor = false;
        for (let j = idx - 1; j >= 0; j--) {
            const t = rawLines[j].trim();
            if (t !== '') {
                hasNeighbor = t.includes('|');
                break;
            }
        }
        if (!hasNeighbor) {
            for (let j = idx + 1; j < rawLines.length; j++) {
                const t = rawLines[j].trim();
                if (t !== '') {
                    hasNeighbor = t.includes('|');
                    break;
                }
            }
        }
        return hasNeighbor;
    };

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const trimmed = line.trim();
        if (trimmed === '') {
            let prevTable = false;
            for (let j = i - 1; j >= 0; j--) {
                const prevTrimmed = rawLines[j].trim();
                if (prevTrimmed !== '') {
                    prevTable = isTableLineRaw(j);
                    break;
                }
            }
            let nextTable = false;
            for (let j = i + 1; j < rawLines.length; j++) {
                const nextTrimmed = rawLines[j].trim();
                if (nextTrimmed !== '') {
                    nextTable = isTableLineRaw(j);
                    break;
                }
            }
            if (prevTable && nextTable) {
                continue; // Skip sandwiched empty line
            }
        }
        processedLines.push(line);
    }

    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    
    const flushTable = (key: any) => {
        if (tableRows.length === 0) return null;
        
        const hasSeparator = tableRows[1] && tableRows[1].every(cell => cell.trim().startsWith('-') || cell.trim() === '');
        const headerRow = tableRows[0];
        const bodyRows = hasSeparator ? tableRows.slice(2) : tableRows.slice(1);
        
        const renderedTable = (
            <div key={key} style={{ overflowX: 'auto', margin: '16px 0', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                            {headerRow.map((cell, cIdx) => (
                                <th key={cIdx} style={{ padding: '10px 12px', border: '1px solid #f0f0f0', textAlign: 'left', fontWeight: 600 }}>
                                    {parseInlineMarkdown(cell.trim())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                {row.map((cell, cIdx) => (
                                    <td key={cIdx} style={{ padding: '10px 12px', border: '1px solid #f0f0f0' }}>
                                        {parseInlineMarkdown(cell.trim())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        
        tableRows = [];
        inTable = false;
        return renderedTable;
    };

    const isTableLineProcessed = (idx: number) => {
        const trimmed = processedLines[idx]?.trim() || '';
        if (!trimmed.includes('|')) return false;
        if (trimmed.startsWith('|')) return true;
        const prev = processedLines[idx - 1]?.trim() || '';
        const next = processedLines[idx + 1]?.trim() || '';
        return prev.includes('|') || next.includes('|');
    };

    for (let i = 0; i < processedLines.length; i++) {
        const line = processedLines[i];
        const trimmed = line.trim();
        
        if (isTableLineProcessed(i)) {
            inTable = true;
            let cells = trimmed.split('|');
            if (cells.length > 0 && cells[0] === '') cells.shift();
            if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
            tableRows.push(cells);
        } else {
            if (inTable) {
                const tbl = flushTable(`table-${i}`);
                if (tbl) elements.push(tbl);
            }
            
            if (trimmed.startsWith('###')) {
                elements.push(<h4 key={i} style={{ marginTop: '20px', marginBottom: '8px', color: '#1f1f1f', fontWeight: 650, fontSize: '15px' }}>{trimmed.replace(/^###\s*/, '')}</h4>);
            } else if (trimmed.startsWith('##')) {
                elements.push(<h3 key={i} style={{ marginTop: '24px', marginBottom: '12px', color: '#111', fontWeight: 700, borderBottom: '1px solid #e8e8e8', paddingBottom: '4px', fontSize: '17px' }}>{trimmed.replace(/^##\s*/, '')}</h3>);
            } else if (trimmed.startsWith('#')) {
                elements.push(<h2 key={i} style={{ marginTop: '28px', marginBottom: '16px', color: '#111', fontWeight: 800, fontSize: '20px' }}>{trimmed.replace(/^#\s*/, '')}</h2>);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                const text = trimmed.replace(/^[-*]\s*/, '');
                elements.push(
                    <div key={i} style={{ paddingLeft: '12px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ marginRight: '8px', color: '#fa541c', fontWeight: 'bold' }}>•</span>
                        <span>{parseInlineMarkdown(text)}</span>
                    </div>
                );
            } else if (/^\d+\.\s+/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.)\s+(.*)/);
                if (match) {
                    elements.push(
                        <div key={i} style={{ paddingLeft: '12px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ marginRight: '8px', color: '#fa541c', fontWeight: 'bold' }}>{match[1]}</span>
                            <span>{parseInlineMarkdown(match[2])}</span>
                        </div>
                    );
                }
            } else if (!trimmed) {
                elements.push(<div key={i} style={{ height: '8px' }} />);
            } else {
                elements.push(<p key={i} style={{ marginBottom: '10px' }}>{parseInlineMarkdown(trimmed)}</p>);
            }
        }
    }
    
    if (inTable) {
        const tbl = flushTable(`table-eof`);
        if (tbl) elements.push(tbl);
    }
    
    return <div style={{ lineHeight: '1.7', fontSize: '14.5px', color: '#434343' }}>{elements}</div>;
};

export default MarkdownRenderer;
