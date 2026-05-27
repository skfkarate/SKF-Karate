import { notFound } from 'next/navigation'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import {
  getBranchBySlugsLive,
  getCityBySlugLive,
} from '@/lib/server/repositories/classes-live'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'
import { AdmissionService } from '@/src/server/services/admission.service'
import BranchDetailClient from './BranchDetailClient'
// FIX: was importing ../../classes.css but BranchDetailClient uses obs-* classes
// that are defined in obsidian.css — corrected import below.
import '../../obsidian.css'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ city: string; branch: string }> }) {
    const { city: citySlug, branch: branchSlug } = await params
    const [city, branch] = await Promise.all([
      getCityBySlugLive(citySlug),
      getBranchBySlugsLive(citySlug, branchSlug),
    ])
    if (!city || !branch) return {}

    return buildSeoMetadata(
      `/classes/${city.slug}/${branch.slug}`,
      `Train at SKF Karate ${branch.name} in ${city.name} for kids karate, adult classes, self-defense, kata, kumite, fitness, and black belt preparation.`,
      { image: branch.photos[0] || undefined }
    )
}

export default async function BranchPage({ params }: { params: Promise<{ city: string; branch: string }> }) {
    const { city: citySlug, branch: branchSlug } = await params
    const [city, branch] = await Promise.all([
      getCityBySlugLive(citySlug),
      getBranchBySlugsLive(citySlug, branchSlug),
    ])

    if (!city || !branch) notFound()

    // Dynamically fetch top performers
    const [athletes, snapshots] = await Promise.all([
        getAllAthletesLive(),
        getRankSnapshotsLive(),
    ])
    
    // Sort snapshots belonging to this branch by totalPoints (descending)
    const branchTopSnapshots = snapshots
        .filter(s => String(s.branchName || '').toLowerCase() === branch.name.toLowerCase() && s.totalPoints > 0)
        .slice(0, 3)

    // Match them to athletes to extract categories and medals
    const topPerformers = branchTopSnapshots.map(snapshot => {
        const athlete = athletes.find(a => a.id === snapshot.athleteId)
        if (!athlete) return null
        
        const medals = (athlete.achievements || []).filter(a => 
            ['tournament-gold', 'tournament-silver', 'tournament-bronze'].includes(a.type)
        )
        const goldCount = medals.filter(m => m.type === 'tournament-gold').length
        const silverCount = medals.filter(m => m.type === 'tournament-silver').length
        const bronzeCount = medals.filter(m => m.type === 'tournament-bronze').length
        
        let medalsString = ''
        if (goldCount) medalsString += '🥇'.repeat(goldCount)
        if (silverCount) medalsString += '🥈'.repeat(silverCount)
        if (bronzeCount) medalsString += '🥉'.repeat(bronzeCount)

        const categoryVal = typeof snapshot.rankingCategory === 'string' 
            ? snapshot.rankingCategory 
            : snapshot.rankingCategory?.key || 'Senior';

        return {
            name: `${athlete.firstName} ${athlete.lastName}`,
            category: categoryVal,
            medals: medalsString || 'No medals yet',
            points: snapshot.totalPoints
        }
    }).filter(Boolean)

    const isDirectSkipBranch = city.branches.length === 1 && city.schools.length === 0;
    let admissionFormHref: string | null = null
    try {
      const admissionConfig = await AdmissionService.getPublicBranchConfig(branch.slug)
      if (admissionConfig.settings.isEnabled && admissionConfig.settings.showPublicCta) {
        admissionFormHref = `/admission/${branch.slug}`
      }
    } catch {
      admissionFormHref = null
    }

    const breadcrumbJsonLd = buildBreadcrumbJsonLd(
      `${branch.name} Branch`,
      `/classes/${city.slug}/${branch.slug}`
    )

    return (
        <>
            <JsonLdScript data={breadcrumbJsonLd} />
            <BranchDetailClient
                branch={branch}
                cityName={city.name}
                citySlug={city.slug}
                topPerformers={topPerformers}
                isDirectSkipBranch={isDirectSkipBranch}
                admissionFormHref={admissionFormHref}
            />
        </>
    )
}
