import { notFound } from 'next/navigation'
import { getCityBySlug, getBranch, getAllCities } from '@/lib/classesData'
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

    return (
        <BranchDetailClient
            branch={branch}
            cityName={city.name}
            citySlug={city.slug}
        />
    )
}
