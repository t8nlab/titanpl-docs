import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

/**
 * Extract content INSIDE `declare global { ... }` with proper brace depth tracking.
 */
function extractDeclareGlobal(content: string): string {
    const marker = 'declare global {';
    const start = content.indexOf(marker);
    if (start === -1) return '';

    let depth = 0;
    let i = start + marker.length;
    let result = '';

    while (i < content.length) {
        const ch = content[i];
        if (ch === '{') { depth++; result += ch; }
        else if (ch === '}') {
            if (depth === 0) break; // closing brace of declare global
            depth--;
            result += ch;
        } else {
            result += ch;
        }
        i++;
    }
    return result;
}

/**
 * Inside `declare global { }`, items like `const t`, `var drift`, `namespace TitanCore`
 * do NOT need `declare` because the wrapper provides it. But when we lift them out
 * to the top-level of an ambient .d.ts file, they DO need `declare`.
 *
 * This function adds the missing `declare` prefix to top-level var/const/let/namespace
 * declarations (lines with ≤4 spaces of leading indentation = top-level in the block).
 */
function addDeclarePrefix(content: string): string {
    return content
        .split('\n')
        .map(line => {
            // Match lines that are top-level in the extracted block (0–4 spaces indent)
            // and have var/const/let/namespace but NOT already `declare`, `interface`, `type`
            const topLevel = /^( {0,4})(var |const |let |namespace )/.test(line);
            const alreadyDeclare = /declare\s/.test(line);
            if (topLevel && !alreadyDeclare) {
                return line.replace(/^( {0,4})(var |const |let |namespace )/, '$1declare $2');
            }
            return line;
        })
        .join('\n');
}

export async function GET() {
    try {
        const nativePath = path.join(process.cwd(), 'node_modules/@titanpl/native/t.native.d.ts');
        const routePath = path.join(process.cwd(), 'node_modules/@titanpl/route/index.d.ts');

        const nativeDts = fs.readFileSync(nativePath, 'utf-8');
        const routeDts = fs.readFileSync(routePath, 'utf-8');

        // Extract content of `declare global { ... }` block
        const rawGlobals = extractDeclareGlobal(nativeDts);

        // Add missing `declare` prefix to top-level var/const/namespace declarations
        // so they work correctly as ambient globals in Monaco's extra lib
        const globalsDts = addDeclarePrefix(rawGlobals);

        return NextResponse.json({ nativeDts, routeDts, globalsDts });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
