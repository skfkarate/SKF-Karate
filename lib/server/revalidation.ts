import { revalidatePath } from 'next/cache'

import { getAllCities } from '@/lib/classesData'

export function revalidateAthleteSitePaths(skfId?: string) {
  revalidatePath('/admin/students')
  revalidatePath('/athlete/search')
  revalidatePath('/rankings')
  revalidatePath('/honours')
  revalidatePath('/classes')
  revalidatePath('/')

  for (const city of getAllCities()) {
    revalidatePath(`/classes/${city.slug}`)

    for (const branch of city.branches) {
      revalidatePath(`/classes/${city.slug}/${branch.slug}`)
    }
  }

  if (skfId) {
    revalidatePath(`/athlete/${skfId}`)
  }
}

export function revalidateEventSitePaths(event?: { id?: string; slug?: string; type?: string }) {
  revalidatePath('/admin/events')
  revalidatePath('/events')
  revalidatePath('/')

  if (event?.id) {
    revalidatePath(`/admin/events/${event.id}`)
  }

  if (event?.slug) {
    if (event.type === 'tournament') {
      revalidatePath('/results')
      revalidatePath('/honours')
      revalidatePath(`/results/${event.slug}`)
    } else {
      revalidatePath(`/events/${event.slug}`)
    }
  }
}

export function revalidateClassesSitePaths(options: {
  citySlug?: string
  branchSlug?: string
} = {}) {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/classes')
  revalidatePath('/classes')
  revalidatePath('/book-trial')
  revalidatePath('/contact')
  revalidatePath('/')

  if (options.citySlug) {
    revalidatePath(`/classes/${options.citySlug}`)
  }

  if (options.citySlug && options.branchSlug) {
    revalidatePath(`/classes/${options.citySlug}/${options.branchSlug}`)
  }
}

export function revalidateSenseiSitePaths(slug?: string) {
  void slug

  revalidatePath('/admin/senseis')
  revalidatePath('/classes')
  revalidatePath('/honours')
  revalidatePath('/')
}

export function revalidateTournamentSitePaths(tournament?: { id?: string; slug?: string }) {
  revalidatePath('/admin/results')
  revalidatePath('/results')
  revalidatePath('/events')
  revalidatePath('/honours')
  revalidatePath('/')

  if (tournament?.id) {
    revalidatePath(`/admin/results/${tournament.id}/edit`)
  }

  if (tournament?.slug) {
    revalidatePath(`/results/${tournament.slug}`)
  }
}

export function revalidatePortalSitePaths() {
  revalidatePath('/admin/portal')
  revalidatePath('/portal', 'layout')
  revalidatePath('/portal/dashboard')
  revalidatePath('/portal/videos')
  revalidatePath('/portal/timetable')
  revalidatePath('/techniques')

  for (const belt of ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']) {
    revalidatePath(`/techniques/${belt}`)
  }
}

export function revalidateBlogSitePaths(slug?: string) {
  revalidatePath('/admin/blogs')
  revalidatePath('/blog')

  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }
}
