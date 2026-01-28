import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPresignedUploadUrl, KYC_ALLOWED_TYPES } from '@/lib/upload'

// POST /api/upload/get-presigned-url - Get presigned URL for direct S3 upload
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, fileType, folder = 'kyc' } = await req.json()

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      )
    }

    // Validate file type for KYC uploads
    if (folder === 'kyc' && !KYC_ALLOWED_TYPES.some(type => fileType.includes(type))) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and PDF allowed' },
        { status: 400 }
      )
    }

    const { uploadUrl, fileUrl, key } = await getPresignedUploadUrl(
      fileName,
      fileType,
      `${folder}/${session.user.id}`
    )

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key,
    })
  } catch (error: any) {
    console.error('Get presigned URL error:', error)
    
    if (error.message === 'AWS credentials not configured') {
      return NextResponse.json(
        { error: 'File upload service not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}
