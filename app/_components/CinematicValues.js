'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const values = [
    { text: "DISCIPLINE", img: "/gallery/In Dojo.jpeg", objectPosition: "center 40%", mobileScale: 1.15 },
    { text: "INCLUSION", img: "/gallery/IMG_1191.JPG.jpeg", objectPosition: "center 30%", mobileScale: 1.25 },
    { text: "SPIRIT", img: "/gallery/Karate Demonstration2 starred.jpeg", objectPosition: "center 20%", mobileScale: 1.2 },
    { text: "EXCELLENCE", img: "/gallery/Tournment8 starred.jpeg", objectPosition: "center 25%", mobileScale: 1.1 },
    { text: "RESPECT", img: "/gallery/Tournment.jpeg", objectPosition: "center 35%", mobileScale: 1.2 },
    { text: "PASSION", img: "/gallery/Train the Elite - Training Camp starred.jpeg", objectPosition: "center 30%", mobileScale: 1.15 },
    { text: "FAMILY", img: "/gallery/In dojo 2 starred.jpeg", objectPosition: "center 30%", mobileScale: 1.15 },
    { text: "HERE WE ARE", img: "/logo/SKF logo.png", objectPosition: "center", mobileScale: 1 }
];

function SlideBackground({ v, index, total, scrollYProgress }) {
    const { img, objectPosition = "center", mobileObjectPosition, mobileScale = 1 } = v;
    const start = index / total;
    const end = (index + 1) / total;
    
    const isFirst = index === 0;
    const isLast = index === total - 1;
    
    const opInput = isFirst ? [0, end, end + 0.05] 
                  : isLast ? [start - 0.05, start, 1] 
                  : [start - 0.05, start, end, end + 0.05];
                  
    const opOutput = isFirst ? [1, 1, 0] 
                   : isLast ? [0, 1, 1] 
                   : [0, 1, 1, 0];
                   
    const opacity = useTransform(scrollYProgress, opInput, opOutput);

    return (
        <motion.div 
            style={{
                position: "absolute",
                inset: 0,
                opacity,
                willChange: "opacity",
                zIndex: 1
            }}
        >
            <style>{`
                .cinematic-img-${index} {
                    object-position: ${objectPosition} !important;
                    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @media (max-width: 768px) {
                    .cinematic-img-${index} {
                        object-position: ${mobileObjectPosition || objectPosition} !important;
                        transform: scale(${mobileScale}) !important;
                    }
                }
            `}</style>
            <Image 
                src={img}
                alt=""
                fill
                sizes="100vw"
                className={`cinematic-img-${index}`}
                style={{ objectFit: "cover" }}
                quality={60}
                priority={index < 2}
                loading={index < 2 ? "eager" : "lazy"}
            />
        </motion.div>
    );
}

function SlideText({ text, index, total, scrollYProgress }) {
    const start = index / total;
    const end = (index + 1) / total;
    const isLast = index === total - 1;

    const opInput = isLast ? [start, start + 0.03, 1] : [start, start + 0.02, end - 0.02, end];
    const opOutput = isLast ? [0, 1, 1] : [0, 1, 1, 0];
    
    const scaleInput = isLast ? [start, 1] : [start, end];
    const scaleOutput = isLast ? [0.8, 1] : [0.8, 1.3];
    
    const opacity = useTransform(scrollYProgress, opInput, opOutput);
    const scale = useTransform(scrollYProgress, scaleInput, scaleOutput);

    return (
        <motion.h2 
            style={{
                position: "absolute",
                opacity,
                scale,
                willChange: "transform, opacity",
                margin: 0,
                textAlign: "center",
                fontWeight: 900,
                color: isLast ? "transparent" : "rgba(255, 255, 255, 0.95)",
                backgroundImage: isLast ? "linear-gradient(to right, #ffb703, #fb8500)" : "none",
                WebkitBackgroundClip: isLast ? "text" : "unset",
                fontSize: "clamp(2.5rem, 8vw, 8rem)",
                letterSpacing: isLast ? "0" : "clamp(5px, 2vw, 20px)",
                paddingLeft: isLast ? "0" : "clamp(5px, 2vw, 20px)",
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
                textShadow: isLast ? "none" : "0 10px 40px rgba(0,0,0,0.8)"
            }}
        >
            {text}
        </motion.h2>
    );
}

export default function CinematicValues() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const indicatorOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

    return (
        <section ref={containerRef} className="cinematic-values-wrapper" style={{ height: "800vh", position: "relative" }}>
            <div className="cinematic-values-sticky" style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden", background: "#020306" }}>
                
                {/* Background Images Layer */}
                {values.map((v, i) => (
                    <SlideBackground 
                        key={`bg-${i}`} 
                        v={v} 
                        index={i} 
                        total={values.length} 
                        scrollYProgress={scrollYProgress} 
                    />
                ))}

                {/* Dark Vignette Overlay */}
                <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "radial-gradient(circle at center, rgba(0,0,0,0.4) 0%, rgba(2,3,6,0.9) 100%), linear-gradient(0deg, rgba(8,10,15,1) 0%, transparent 30%, rgba(8,10,15,0.7) 100%)",
                    zIndex: 2,
                    pointerEvents: "none"
                }} />

                {/* Text Layer */}
                <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    {values.map((v, i) => (
                        <SlideText 
                            key={`text-${i}`} 
                            text={v.text} 
                            index={i} 
                            total={values.length} 
                            scrollYProgress={scrollYProgress} 
                        />
                    ))}
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    style={{ 
                        position: "absolute", 
                        bottom: "40px", 
                        left: "50%", 
                        x: "-50%", 
                        zIndex: 4, 
                        color: "#fff", 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        opacity: indicatorOpacity,
                        pointerEvents: "none"
                    }}
                >
                    <span style={{ fontSize: "0.7rem", letterSpacing: "3px", opacity: 0.5, marginBottom: "15px", textTransform: "uppercase", fontWeight: 700 }}>Keep Scrolling</span>
                    <motion.div 
                        animate={{ y: [0, 8, 0] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: "2px", height: "40px", background: "linear-gradient(to bottom, var(--gold), transparent)" }} 
                    />
                </motion.div>
            </div>
        </section>
    );
}
