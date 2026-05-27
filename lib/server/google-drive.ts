import { Readable } from 'node:stream'

import { google } from 'googleapis'

import { env, hasEnv } from '@/src/server/config/env'
import { ExternalServiceError } from '@/src/server/lib/errors'

type DriveFileInput = {
  buffer: Buffer
  filename: string
  mimeType: string
  branchSlug: string
  studentName: string
  rootFolderId?: string
  folderLabel?: string
  namePrefix?: string
}

type DriveUploadResult = {
  fileId: string
  name: string
  webViewLink: string
  mimeType: string
  size: number
}

type DriveDownloadResult = {
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
}

const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

function getDriveClient() {
  if (!hasEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY')) {
    throw new ExternalServiceError('Admission Drive storage is not configured.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

function getAdmissionPhotoRootFolderId() {
  return env.ADMISSION_PHOTO_DRIVE_FOLDER_ID || env.ADMISSION_DRIVE_ROOT_FOLDER_ID || ''
}

function sanitizeDriveName(value: string) {
  return String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|#%{}~&]/g, '-')
    .replace(/\s+/g, ' ')
    .slice(0, 120) || 'admission'
}

async function ensureFolder(parentId: string, name: string) {
  const drive = getDriveClient()
  const safeName = sanitizeDriveName(name)
  const escapedName = safeName.replace(/'/g, "\\'")
  const escapedParent = parentId.replace(/'/g, "\\'")

  const existing = await drive.files.list({
    q: [
      `mimeType = '${FOLDER_MIME_TYPE}'`,
      `name = '${escapedName}'`,
      `'${escapedParent}' in parents`,
      'trashed = false',
    ].join(' and '),
    fields: 'files(id, name)',
    pageSize: 1,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  const folder = existing.data.files?.[0]
  if (folder?.id) return folder.id

  const created = await drive.files.create({
    requestBody: {
      name: safeName,
      mimeType: FOLDER_MIME_TYPE,
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  })

  if (!created.data.id) {
    throw new ExternalServiceError('Unable to create admission Drive folder.')
  }

  return created.data.id
}

export async function uploadAdmissionFileToDrive(input: DriveFileInput): Promise<DriveUploadResult> {
  const drive = getDriveClient()
  const rootFolderId = input.rootFolderId
  if (!rootFolderId) throw new ExternalServiceError('Admission Drive folder is not configured.')

  const now = new Date()
  const monthFolderName = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const branchFolderId = await ensureFolder(rootFolderId, input.branchSlug)
  const monthFolderId = await ensureFolder(branchFolderId, monthFolderName)
  const targetFolderId = input.folderLabel
    ? await ensureFolder(monthFolderId, input.folderLabel)
    : monthFolderId
  const prefix = input.namePrefix ? `${sanitizeDriveName(input.namePrefix)}-` : ''
  const fileName = `${prefix}${sanitizeDriveName(input.studentName)}-${Date.now()}-${sanitizeDriveName(input.filename)}`

  const created = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [targetFolderId],
    },
    media: {
      mimeType: input.mimeType,
      body: Readable.from(input.buffer),
    },
    fields: 'id, name, webViewLink, mimeType, size',
    supportsAllDrives: true,
  })

  if (!created.data.id) {
    throw new ExternalServiceError('Unable to upload admission file to Drive.')
  }

  return {
    fileId: created.data.id,
    name: created.data.name || fileName,
    webViewLink: created.data.webViewLink || `https://drive.google.com/file/d/${created.data.id}/view`,
    mimeType: created.data.mimeType || input.mimeType,
    size: Number(created.data.size || input.buffer.length),
  }
}

export async function uploadAdmissionPhotoToDrive(input: DriveFileInput): Promise<DriveUploadResult> {
  const rootFolderId = getAdmissionPhotoRootFolderId()
  return uploadAdmissionFileToDrive({
    ...input,
    rootFolderId,
    folderLabel: env.ADMISSION_PHOTO_DRIVE_FOLDER_ID ? undefined : 'student-photos',
    namePrefix: 'photo',
  })
}

export async function downloadAdmissionDriveFile(fileId: string): Promise<DriveDownloadResult> {
  const drive = getDriveClient()
  const metadata = await drive.files.get({
    fileId,
    fields: 'name, mimeType, size',
    supportsAllDrives: true,
  })
  const media = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    {
      responseType: 'arraybuffer',
    }
  )

  const buffer = Buffer.from(media.data as ArrayBuffer)

  return {
    buffer,
    filename: metadata.data.name || 'admission-photo',
    mimeType: metadata.data.mimeType || 'application/octet-stream',
    size: Number(metadata.data.size || buffer.length),
  }
}
