/**
 * Seed: Kyu Belts — grading page belt descriptions with philosophy.
 */

export interface KyuBelt {
  id: string
  kyu: string
  belt: string
  color: string
  textSync: string
  desc: string
}

export const kyuBelts: KyuBelt[] = [
  { id: 'kyu_010', kyu: '10th Kyu', belt: 'White Belt', color: '#f8f9fa', textSync: '#212529', desc: "\"In the beginner's mind there are many possibilities, in the expert's mind there are few.\" — Shunryū Suzuki. White represents Shoshin (初心), the empty mind ready to receive. You own nothing yet — and that is your greatest advantage." },
  { id: 'kyu_009', kyu: '9th Kyu', belt: 'Yellow Belt', color: '#ffb703', textSync: '#ffffff', desc: "The first sunrise. As Gichin Funakoshi taught: \"Karate begins and ends with courtesy.\" The yellow belt learns that every technique starts with Rei (礼) — respect and humility on the tatami." },
  { id: 'kyu_008', kyu: '8th Kyu', belt: 'Orange Belt', color: '#fb8500', textSync: '#ffffff', desc: "The warming fire within. The practitioner discovers Kime (決め) — the art of focusing total energy into a single decisive point. Movements transition from mechanical repetition to deliberate intent." },
  { id: 'kyu_007', kyu: '7th Kyu', belt: 'Green II', color: '#2a9d8f', textSync: '#ffffff', desc: "The bamboo bends but never breaks. At this stage, the karateka learns Tai Sabaki (体捌き) — body shifting to evade and redirect force. As Miyamoto Musashi wrote: \"Do not waste movement. Do not waste time.\"" },
  { id: 'kyu_006', kyu: '6th Kyu', belt: 'Green I', color: '#206a5d', textSync: '#ffffff', desc: "Deep roots, unbending trunk. The student begins to grasp Koshi (腰) — generating devastating power from the hips, not the arms. Every senior karateka knows: the punch is born in the floor, travels through the hips, and exits through the fist." },
  { id: 'kyu_005', kyu: '5th Kyu', belt: 'Blue Belt', color: '#023e8a', textSync: '#ffffff', desc: "The ocean has no wasted motion. Blue represents the pursuit of Nagare (流れ) — flow. Techniques begin to chain seamlessly. The gap between thought and action narrows. As the ancient maxim states: \"Flowing water never goes stale.\"" },
  { id: 'kyu_004', kyu: '4th Kyu', belt: 'Purple Belt', color: '#7209b7', textSync: '#ffffff', desc: "\"To know the Kata is not enough. You must know the Bunkai.\" Purple marks the threshold where the student looks beyond the visible form and discovers the hidden combat applications (Bunkai 分解) embedded within every Kata since the Okinawan masters." },
  { id: 'kyu_003', kyu: '3rd Kyu', belt: 'Brown III', color: '#cd7f32', textSync: '#ffffff', desc: "The harvest before winter. Brown represents earth — the karateka is grounded, conditioned, dangerous. The concept of Ikken Hissatsu (一拳必殺) — \"one strike, certain defeat\" — becomes the standard. No technique is thrown without total commitment." },
  { id: 'kyu_002', kyu: '2nd Kyu', belt: 'Brown II', color: '#a0522d', textSync: '#ffffff', desc: "Zanshin (残心) — the lingering mind. After delivering a technique, the warrior remains alert, poised, unfinished. There is no relaxation until the threat is neutralized. At this level, mental discipline eclipses physical ability." },
  { id: 'kyu_001', kyu: '1st Kyu', belt: 'Brown I', color: '#5c4033', textSync: '#ffffff', desc: "\"Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.\" The final Kyu grade demands absolute mastery of fundamentals. Fancy techniques mean nothing — Kihon (基本), the basics, must be flawless under any condition." },
]
