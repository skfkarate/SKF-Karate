import { FaMapMarkerAlt } from 'react-icons/fa'

export default function SummerCampLocation() {
  return (
    <section className="section location">
      <div className="container">
        <div className="location__header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label">
            <FaMapMarkerAlt /> Camp Venue
          </span>
          <h2 className="section-title">
            Where the <span className="text-gradient">Action Happens</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            MP SPORTS CLUB <br />
            14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru, Karnataka 560056
          </p>
        </div>

        <div
          className="glass-card"
          style={{ padding: '1rem', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}
        >
          <a
            href="https://www.google.com/maps/place/MP+SPORTS+CLUB/@12.9570313,77.4992052,17z/data=!4m14!1m7!3m6!1s0x3bae3e9c06dbfd9f:0x35b15daf110f7b7!2sMP+SPORTS+CLUB!8m2!3d12.9570313!4d77.4992052!16s%2Fg%2F11dfk18c3k!3m5!1s0x3bae3e9c06dbfd9f:0x35b15daf110f7b7!8m2!3d12.9570313!4d77.4992052!16s%2Fg%2F11dfk18c3k?entry=ttu"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              cursor: 'pointer',
            }}
            aria-label="Open MP SPORTS CLUB in Google Maps"
          ></a>

          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.243542284908!2d77.4966302!3d12.9570313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3e9c06dbfd9f%3A0x35b15daf110f7b7!2sMP%20SPORTS%20CLUB!5e0!3m2!1sen!2sin!4v1710323719948!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0, borderRadius: '16px', filter: 'invert(90%) hue-rotate(180deg) contrast(85%)' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="SKF Karate Location"
          ></iframe>
        </div>
      </div>
    </section>
  )
}
