/**
 * Mock API Responses — wraps seed data in API-like response shapes.
 * Useful for testing, storybook, and offline development.
 */

import { instructors, getSenseis, getExecutiveCommittee } from '../seed/instructors'
import { dojos } from '../seed/dojos'
import { events } from '../seed/events'
import { products } from '../seed/products'
import { testimonials } from '../seed/testimonials'
import { galleryPhotos } from '../seed/gallery'

interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: { total: number; page: number; perPage: number }
}

function paginate<T>(items: T[], page = 1, perPage = 20): ApiResponse<T[]> {
  const start = (page - 1) * perPage
  const data = items.slice(start, start + perPage)
  return {
    success: true,
    data,
    meta: { total: items.length, page, perPage },
  }
}

function single<T>(item: T | null): ApiResponse<T | null> {
  return { success: !!item, data: item }
}

/* ── Instructors ── */
export function mockGetAllInstructors(page = 1) {
  return paginate(instructors, page)
}
export function mockGetSenseis() {
  return { success: true, data: getSenseis() }
}
export function mockGetExecutiveCommittee() {
  return { success: true, data: getExecutiveCommittee() }
}
export function mockGetInstructorById(id: string) {
  return single(instructors.find(i => i.id === id) ?? null)
}

/* ── Dojos ── */
export function mockGetAllDojos() {
  return { success: true, data: dojos }
}
export function mockGetDojoBySlug(slug: string) {
  return single(dojos.find(d => d.slug === slug) ?? null)
}

/* ── Events ── */
export function mockGetAllEvents(page = 1) {
  return paginate(events, page)
}
export function mockGetEventBySlug(slug: string) {
  return single(events.find(e => e.slug === slug) ?? null)
}

/* ── Products ── */
export function mockGetAllProducts(page = 1) {
  return paginate(products, page)
}
export function mockGetProductById(id: string) {
  return single(products.find(p => p.id === id) ?? null)
}
export function mockGetProductsByCategory(category: string, page = 1) {
  return paginate(products.filter(p => p.category === category), page)
}

/* ── Testimonials ── */
export function mockGetAllTestimonials() {
  return { success: true, data: testimonials }
}

/* ── Gallery ── */
export function mockGetAllPhotos() {
  return { success: true, data: galleryPhotos }
}
export function mockGetPhotosByCategory(cat: string) {
  return { success: true, data: galleryPhotos.filter(p => p.cat === cat) }
}
