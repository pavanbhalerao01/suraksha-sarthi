import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const sender = formData.get('sender') as string;
    const senderCamp = formData.get('senderCamp') as string;
    const recipientsStr = formData.get('recipients') as string;
    const message = formData.get('message') as string;
    const images = formData.getAll('images') as File[];

    // Validate required fields
    if (!sender || !senderCamp || !recipientsStr || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let recipients: string[];
    try {
      recipients = JSON.parse(recipientsStr);
    } catch {
      return NextResponse.json(
        { error: 'Invalid recipients format' },
        { status: 400 }
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'At least one recipient must be selected' },
        { status: 400 }
      );
    }

    // Process images (for now, we'll store basic info)
    // In production, you'd upload these to cloud storage (S3, Cloudinary, etc.)
    const imageInfo = images
      .filter(img => img.size > 0)
      .map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      }));

    // Store message in database
    // Note: You'll need to create a Message model in schema.prisma
    // For now, we'll return success without storing
    
    console.log('Message sent:', {
      from: sender,
      camp: senderCamp,
      to: recipients,
      message: message.substring(0, 50) + '...',
      imageCount: imageInfo.length
    });

    // In a real implementation, you would:
    // 1. Save message to database with Message model
    // 2. Upload images to cloud storage
    // 3. Send notifications to recipients (SMS, email, push notifications)
    // 4. Create message threads/conversations

    return NextResponse.json({
      success: true,
      messageId: `msg_${Date.now()}`,
      recipients: recipients,
      imageCount: imageInfo.length,
      sentAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
