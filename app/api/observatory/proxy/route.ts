
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { url, method = 'GET' } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        // Server-side fetch to the local Titan instance
        // This bypasses browser CORS restrictions
        const response = await fetch(url, {
            method,
            headers: {
                // Forward content type if needed, or keep generic
                'Content-Type': 'application/json',
            },
        });

        // Read the text (could be JSON or plain text)
        const text = await response.text();

        // Try to parse as JSON to return proper object if possible, otherwise string
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = text;
        }

        return NextResponse.json({
            status: response.status,
            statusText: response.statusText,
            data: data
        });

    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json({
            error: 'Failed to access Titan orbit via proxy',
            details: error.message
        }, { status: 502 });
    }
}
