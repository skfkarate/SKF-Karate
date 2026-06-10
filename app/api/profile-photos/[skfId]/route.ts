import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { NextResponse } from 'next/server'

import { getLocalProfilePhotoFile } from '@/lib/server/profile-photos'
import { getAthleteFallbackProfilePhoto } from '@/lib/profile-photos'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ skfId: string }> }
) {
  const { skfId } = await params
  const photoFile = getLocalProfilePhotoFile(skfId)

  if (!photoFile) {
    const gender = new URL(request.url).searchParams.get('gender')
    const fallbackPathname = getAthleteFallbackProfilePhoto(gender)
    const fallbackFilePath = path.join(
      process.cwd(),
      'public',
      fallbackPathname.replace(/^\/+/, '')
    )
    const fallbackFile = await readFile(fallbackFilePath)

    return new NextResponse(new Uint8Array(fallbackFile), {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': 'image/png',
      },
    })
  }

  const file = await readFile(photoFile.filePath)

  return new NextResponse(new Uint8Array(file), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': photoFile.contentType,
    },
  })
}
