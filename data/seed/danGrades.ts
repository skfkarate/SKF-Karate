/**
 * Seed: Dan Grades — black belt level descriptions for grading page.
 */

export interface DanGrade {
  id: string
  dan: string
  level: string
  kanji: string
  role: string
  principle: string
  desc: string
}

export const danGrades: DanGrade[] = [
  { id: 'dan_001', dan: 'Shodan', level: '1st Dan', kanji: '初段', role: 'Sempai — Senior Student', principle: 'Hitotsu! Doryoku no Seishin wo Yashinau Koto — Foster the spirit of effort.', desc: "\"Shodan does not mean expert. It means you are now ready to truly begin.\" — Gichin Funakoshi. The Black Belt is not a destination; it is permission to start learning Karate-do for real. The ego dissolves; the student is reborn." },
  { id: 'dan_002', dan: 'Nidan', level: '2nd Dan', kanji: '弐段', role: 'Sempai — Mentor & Demonstrator', principle: 'Hitotsu! Makoto no Michi wo Mamoru Koto — Be faithful and sincere.', desc: "The rough edges are polished. Techniques become silk over steel — smooth on the surface, devastating underneath. The Nidan practitioner begins teaching junior students, learning that to teach is the deepest form of understanding." },
  { id: 'dan_003', dan: 'Sandan', level: '3rd Dan', kanji: '参段', role: 'Sensei — Qualified Instructor', principle: 'Hitotsu! Reigi wo Omonzuru Koto — Respect others and practice etiquette.', desc: "\"Karate is not about winning. Karate is about not losing — not losing your composure, not losing your dignity.\" At Sandan, Bunkai mastery is expected. The practitioner sees the invisible threads connecting every Kata to real combat." },
  { id: 'dan_004', dan: 'Yondan', level: '4th Dan', kanji: '四段', role: 'Shihan-Dai — Master Instructor', principle: 'Hitotsu! Kekki no Yu wo Imashimuru Koto — Refrain from violent and impetuous behaviour.', desc: "Sensei (先生) — \"one who has walked before.\" The Yondan has earned the full right to lead a Dojo, shape curriculum, and forge the next generation. Physical technique and teaching pedagogy exist in perfect Wa (和) — harmony." },
  { id: 'dan_005', dan: 'Godan', level: '5th Dan', kanji: '五段', role: 'Shihan — Grand Master', principle: 'Hitotsu! Jinkaku Kansei ni Tsutomuru Koto — Seek perfection of character.', desc: "Mushin (無心) — the mind of no mind. At Godan, technique is forgotten because it has become the practitioner. There is no separation between thought and action. The body moves; the conscious mind simply watches. This is the way of the master." },
]
