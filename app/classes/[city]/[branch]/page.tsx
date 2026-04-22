import { notFound } from 'next/navigation'
import { getCityBySlug, getBranch, getAllCities } from '@/lib/classesData'
import { getAllAthletes, getRankSnapshots } from '@/lib/server/repositories/athletes'
import BranchDetailClient from './BranchDetailClient'
import '../../classes.css'

export async function generateStaticParams() {
    const params: { city: string; branch: string }[] = []
    for (const city of getAllCities()) {
        for (const branch of city.branches) {
            params.push({ city: city.slug, branch: branch.slug })
        }
    }
    return params
}

export async function generateMetadata({ params }: { params: Promise<{ city: string; branch: string }> }) {
    const { city: citySlug, branch: branchSlug } = await params
    const city = getCityBySlug(citySlug)
    const branch = getBranch(citySlug, branchSlug)
    if (!city || !branch) return {}

    return {
        title: `Karate Classes in ${branch.name}, ${city.name}`,
        description: `SKF Karate ${branch.name} branch in ${city.name}. ${branch.sensei} leads classes on ${branch.classDays.length} days/week. Book a free trial class.`,
    }
}

export default async function BranchPage({ params }: { params: Promise<{ city: string; branch: string }> }) {
    const { city: citySlug, branch: branchSlug } = await params
    const city = getCityBySlug(citySlug)
    const branch = getBranch(citySlug, branchSlug)

    if (!city || !branch) notFound()

    // Dynamically fetch top performers
    const athletes = getAllAthletes()
    const snapshots = getRankSnapshots()
    
    // Sort snapshots belonging to this branch by totalPoints (descending)
    const branchTopSnapshots = snapshots
        .filter(s => s.branchName.toLowerCase() === branch.name.toLowerCase() && s.totalPoints > 0)
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
