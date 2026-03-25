import './summer-camp.css'

export default function SummerCampLoading() {
    return (
        <div className="camp-loading">
            {/* Hero skeleton */}
            <div className="camp-loading__hero">
                <div className="camp-loading__shimmer camp-loading__bar--md" style={{ width: '30%' }}></div>
                <div className="camp-loading__shimmer camp-loading__bar--lg"></div>
                <div className="camp-loading__shimmer camp-loading__bar--sm"></div>
                <div className="camp-loading__shimmer camp-loading__bar--md" style={{ width: '50%', marginTop: '1rem' }}></div>
            </div>

            {/* Benefits cards skeleton */}
            <div className="camp-loading__cards">
                <div className="camp-loading__shimmer camp-loading__card"></div>
                <div className="camp-loading__shimmer camp-loading__card"></div>
                <div className="camp-loading__shimmer camp-loading__card"></div>
            </div>

            {/* VIP Ticket skeleton */}
            <div className="camp-loading__shimmer camp-loading__ticket"></div>
        </div>
    )
}
