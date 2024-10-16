import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { name, messageType } = await req.json();
    // トピック名とメッセージタイプの検証
    if (name && messageType) {
        return NextResponse.json({ success: true, message: 'Topic added successfully' }, { status: 200 });
    } else {
        return NextResponse.json({ success: false, message: 'Invalid topic name or message type' }, { status: 400 });
        // return NextResponse.json({ success: false, message: `name: ${name}, messageType: ${messageType}` }, { status: 400 });
    }
}