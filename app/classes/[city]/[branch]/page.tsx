import { notFound } from 'next/navigation'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import {
  getBranchBySlugsLive,
  getCityBySlugLive,
} from '@/lib/server/repositories/classes-live'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'
import BranchDetailClient from './BranchDetailClient'
// FIX: was importing ../../classes.css but BranchDetailClient uses obs-* classes
// that are defined in obsidian.css — corrected import below.
import '../../obsidian.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ city: string; branch: string }> }) {
    const { city: citySlug, branch: branchSlug } = await params
    const [city, branch] = await Promise.all([
      getCityBySlugLive(citySlug),
      getBranchBySlugsLive(citySlug, branchSlug),
    ])
    if (!city || !branch) return {}
    const canonicalUrl = absoluteSiteUrl(`/classes/${city.slug}/${branch.slug}`)
    const imageUrl = absoluteMediaUrl(branch.photos[0] || undefined)

    return {
        title: 'SKF Karate',
        description: `SKF Karate ${branch.name} branch in ${city.name}. ${branch.sensei} leads classes on ${branch.classDays.length} days/week. Book a free trial class.`,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: 'SKF Karate',
            description: `SKF Karate ${branch.name} branch in ${city.name}. Book a free trial class.`,
            url: canonicalUrl,
            type: 'website',
            images: [{ url: imageUrl, width: 1200, height: 630, alt: `SKF Karate ${branch.name} branch` }],
        },
        twitter: {
            card: 'summary_large_image',
            title: 'SKF Karate',
            description: `Book a free trial class at SKF Karate ${branch.name}.`,
            images: [imageUrl],
        },
    }
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

    return (
        <BranchDetailClient
            branch={branch}
            cityName={city.name}
            citySlug={city.slug}
            topPerformers={topPerformers}
            isDirectSkipBranch={isDirectSkipBranch}
        />
    )
}
