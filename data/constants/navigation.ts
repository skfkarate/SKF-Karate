/**
 * Navigation Constants — all nav structures in one place.
 */

/* ── Public Navbar ── */
export interface NavMenuItem {
  label: string
  href?: string
  children?: NavMenuItem[]
  disabled?: boolean
}

export const PUBLIC_NAV_ITEMS: NavMenuItem[] = [
  {
    label: 'Events',
    children: [
      { label: 'Upcoming Events', href: '/events' },
      { label: 'Results', href: '/results' },
    ],
  },
  {
    label: 'Rankings',
    children: [
      { label: 'Find Profile', href: '/athlete/search' },
      { label: 'Official Rankings', href: '/rankings' },
      { label: 'Honours Board', href: '/honours' },
    ],
  },
  { label: 'Find a Class', href: '/classes' },
  { label: 'Gallery', href: '/gallery' },
  {
    label: 'About',
    children: [
      { label: 'About SKF', href: '/about' },
      { label: 'Contact & FAQ', href: '/contact' },
      { label: 'Blogs', href: '#', disabled: true },
    ],
  },
  { label: 'Shop', href: '/shop' },
  {
    label: 'For Athletes',
    children: [
      { label: 'Athlete Portal', href: '/portal' },
      { label: 'Belt Grading', href: '/grading' },
      { label: 'Verify Certificate', href: '/verify' },
    ],
  },
]

/* ── Footer Quick Links ── */
export const FOOTER_QUICK_LINKS = [
  { label: 'Classes', href: '/classes' },
  { label: 'About SKF', href: '/about' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Events', href: '/events' },
  { label: 'Results', href: '/results' },
  { label: 'Belt Grading', href: '/grading' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
] as const

/* ── Footer Legal Links ── */
export const FOOTER_LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
] as const

/* ── Admin Sidebar ── */
export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Programs', href: '/admin/programs' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Enrollments', href: '/admin/enrollments' },
  { label: 'Certificates', href: '/admin/certificates' },
  { label: 'Shop Products', href: '/admin/shop/products' },
  { label: 'Shop Orders', href: '/admin/shop' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Results', href: '/admin/results' },
  { label: 'Settings', href: '/admin/settings' },
] as const

/* ── Portal Nav ── */
export const PORTAL_NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Identity', iconName: 'UserCircle' },
  { href: '/portal/grading', label: 'Grading', iconName: 'TrendingUp' },
  { href: '/portal/trophy-room', label: 'Trophy Room', iconName: 'Trophy' },
  { href: '/portal/events', label: 'Events', iconName: 'Flag' },
  { href: '/portal/videos', label: 'Home Practice', iconName: 'PlayCircle' },
  { href: '/portal/fees', label: 'Treasury', iconName: 'CreditCard' },
  { href: '/portal/timetable', label: 'Timetable', iconName: 'Calendar' },
  { href: '/portal/notices', label: 'Notices', iconName: 'Bell' },
] as const
