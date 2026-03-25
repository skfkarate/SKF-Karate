import { FaMedal } from 'react-icons/fa'

export default function MedalTally({ medals }) {
  return (
    <div className="medal-dashboard-strip">
      <div className="medal-ds-item">
        <div className="medal-ds-icon medal-ds-icon--gold"><FaMedal /></div>
        <div className="medal-ds-info">
          <div className="medal-ds-count medal-ds-count--gold">{medals.gold}</div>
          <div className="medal-ds-label">Gold</div>
        </div>
      </div>
      
      <div className="medal-ds-divider"></div>
      
      <div className="medal-ds-item">
        <div className="medal-ds-icon medal-ds-icon--silver"><FaMedal /></div>
        <div className="medal-ds-info">
          <div className="medal-ds-count medal-ds-count--silver">{medals.silver}</div>
          <div className="medal-ds-label">Silver</div>
        </div>
      </div>
      
      <div className="medal-ds-divider"></div>
      
      <div className="medal-ds-item">
        <div className="medal-ds-icon medal-ds-icon--bronze"><FaMedal /></div>
        <div className="medal-ds-info">
          <div className="medal-ds-count medal-ds-count--bronze">{medals.bronze}</div>
          <div className="medal-ds-label">Bronze</div>
        </div>
      </div>
    </div>
  )
}
