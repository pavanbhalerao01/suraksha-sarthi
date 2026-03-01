import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const teamId = formData.get('teamId') as string;
    const teamType = formData.get('teamType') as string;
    const teamName = formData.get('teamName') as string;
    const incidentType = formData.get('incidentType') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const photos = formData.getAll('photos') as File[];

    // Validate required fields
    if (!teamId || !teamType || !incidentType || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Process photos (for now, we'll store basic info)
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    const photoInfo = photos
      .filter(photo => photo.size > 0)
      .map(photo => ({
        name: photo.name,
        size: photo.size,
        type: photo.type,
        uploadedAt: new Date().toISOString(),
      }));

    console.log('📸 Incident photos uploaded:', {
      team: teamName,
      type: incidentType,
      location,
      photoCount: photoInfo.length,
      description: description?.substring(0, 50) + '...',
    });

    // In production:
    // 1. Upload photos to cloud storage
    // 2. Save incident report to database with photo URLs
    // 3. Notify relevant authorities
    // 4. Create task/incident in coordination system

    return NextResponse.json({
      success: true,
      incidentId: `incident_${Date.now()}`,
      photoCount: photoInfo.length,
      uploadedAt: new Date().toISOString(),
      message: `Incident report uploaded with ${photoInfo.length} photo(s)`,
    });
  } catch (error) {
    console.error('Error uploading incident photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload incident photos' },
      { status: 500 }
    );
  }
}
