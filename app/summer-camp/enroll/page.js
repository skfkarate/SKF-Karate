import SummerCampEnrollForm from '../../_components/pages/summer-camp/SummerCampEnrollForm'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'
import './enroll.css'

export const metadata = {
    title: 'VIP Enrollment — Summer Camp | SKF Karate',
    description: 'Secure your spot in the SKF Karate Summer Camp 2026. Only 20 slots available for Month 1 FREE.',
}

export default function EnrollPage() {
    return (
        <div className="enroll-wizard-page">
            <Link href="/summer-camp" className="wizard-back-link">
                <FaArrowLeft /> Back to Camp
            </Link>
            
            <div className="wizard-container">
                <div className="wizard-header">
                    <h1>Register for <strong>Free Camp</strong></h1>
                    <p>Takes less than 30 seconds. Secure your VIP slot today.</p>
                </div>

                <SummerCampEnrollForm />
            </div>
        </div>
    )
}
