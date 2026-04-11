export async function POST() {
  const response = Response.json({ success: true })
  response.headers.set('Set-Cookie',
    'skf_student_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/')
  return response
}
