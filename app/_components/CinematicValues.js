'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const values = [
    { text: "DISCIPLINE", img: "/gallery/In Dojo.jpeg" },
    { text: "INCLUSION", img: "/gallery/IMG_1191.JPG.jpeg" },
    { text: "SPIRIT", img: "/gallery/Karate Demonstration2 starred.jpeg" },
    { text: "EXCELLENCE", img: "/gallery/Tournment8 starred.jpeg" },
    { text: "RESPECT", img: "/gallery/Tournment.jpeg" },
    { text: "PASSION", img: "/gallery/Train the Elite - Training Camp starred.jpeg" },
    { text: "FAMILY", img: "/gallery/In dojo 2 starred.jpeg" },
    { text: "HERE WE ARE", img: "/logo/SKF logo.png", isLogo: true }
];

function SlideBackground({ img, index, total, scrollYProgress, isLogo }) {
    const start = index / total;
    const end = (index + 1) / total;
    const isFirst = index === 0;
    const isLast = index === total - 1;
    
    // Smooth opacity fade
    const opInput = isFirst ? [0, end, end + 0.1]
                  : isLast ? [start - 0.1, start, 1]
                  : [start - 0.1, start, end, end + 0.1];
    const opOutput = isFirst ? [1, 1, 0]
                   : isLast ? [0, 1, 1]
                   : [0, 1, 1, 0];
    const opacity = useTransform(scrollYProgress, opInput, opOutput);

    // Ken Burns scale effect moving towards the user
    const scale = useTransform(scrollYProgress, [start, end], [1, 1.15]);

    // Cinematic blur during transitions
    const blurInput = isFirst ? [0, end, end + 0.15]
                    : isLast ? [start - 0.15, start, 1]
                    : [start - 0.15, start, end, end + 0.15];
    const blurOutput = isFirst ? [0, 0, 20]
                     : isLast ? [20, 0, 0]
                     : [20, 0, 0, 20];
    const blurVal = useTransform(scrollYProgress, blurInput, blurOutput);
    const filter = useTransform(blurVal, (val) => `blur(${val}px)`);

    return (
        <motion.div 
            style={{
                position: "absolute",
                inset: 0,
                opacity,
                scale,
                filter,
                willChange: "transform, opacity, filter",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            {isLogo ? (
                <div style={{ position: "relative", width: "60vw", height: "60vh", maxWidth: "500px", marginBottom: "15vh" }}>
                    <Image 
                        src={img}
                        alt="SKF Logo"
                        fill
                        sizes="(max-width: 768px) 80vw, 50vw"
                        style={{ objectFit: "contain", objectPosition: "center" }}
                        quality={90}
                        priority
                    />
                </div>
            ) : (
                <Image 
                    src={img}
                    alt=""
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    quality={75}
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                />
            )}
        </motion.div>
    );
}

function SlideText({ text, index, total, scrollYProgress }) {
    const start = index / total;
    const peak = (index + 0.5) / total;
    const end = (index + 1) / total;
    const isFirst = index === 0;
    const isLast = index === total - 1;

    // Fades in slightly after background, fades out slightly before
    const opInput = isFirst ? [0, peak, end - 0.05]
                  : isLast ? [start + 0.05, peak, 1] 
                  : [start + 0.05, peak, end - 0.05];
    const opOutput = isFirst ? [1, 1, 0]
                   : isLast ? [0, 1, 1] 
                   : [0, 1, 0];
    const opacity = useTransform(scrollYProgress, opInput, opOutput);
    
    // Slow cinematic drift towards the camera
    const scaleInput = isLast ? [start, 1] : [start, end];
    const scaleOutput = isLast ? [0.8, 1] : [0.75, 1.25];
    const scale = useTransform(scrollYProgress, scaleInput, scaleOutput);

    // Cinematic text blur (starts blurry, focuses, blurs out)
    const blurInput = isFirst ? [0, peak, end - 0.05]
                    : isLast ? [start + 0.05, peak, 1]
                    : [start + 0.05, peak, end - 0.05];
    const blurOutput = isFirst ? [0, 0, 15]
                     : isLast ? [15, 0, 0]
                     : [15, 0, 15];
    const blurVal = useTransform(scrollYProgress, blurInput, blurOutput);
    const filter = useTransform(blurVal, (val) => isLast ? `blur(0px)` : `blur(${val}px)`);

    // Letter spacing tracking expands as it moves forward for an epic feel
    const trackingVal = useTransform(scrollYProgress, [start, end], [4, 25]);
    const letterSpacing = useTransform(trackingVal, (val) => isLast ? "8px" : `${val}px`);

    return (
        <motion.h2 
            style={{
                position: "absolute",
                opacity,
                scale,
                filter,
                letterSpacing,
                willChange: "transform, opacity, filter",
                margin: 0,
                marginTop: isLast ? "30vh" : 0, /* Push text down to make room for logo */
                textAlign: "center",
                fontWeight: 900,
                color: isLast ? "transparent" : "rgba(255, 255, 255, 0.95)",
                backgroundImage: isLast ? "linear-gradient(to right, #ffb703, #e85d04)" : "none",
                WebkitBackgroundClip: isLast ? "text" : "unset",
                fontSize: "clamp(2rem, 8vw, 7rem)",
                fontFamily: "var(--font-heading)",
                textTransform: "uppercase",
                textShadow: isLast ? "none" : "0 10px 40px rgba(0,0,0,0.9)",
                padding: "0 1rem"
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

    const indicatorOpacity = useTransform(scrollYProgress, [0.02, 0.06], [1, 0]);

    return (
        // Increased height for a much smoother, longer scroll experience
        <section ref={containerRef} className="cinematic-values-wrapper" style={{ height: "1200vh", position: "relative", background: "#020306" }}>
            <div className="cinematic-values-sticky" style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden" }}>
                
                {/* Background Images Layer */}
                {values.map((v, i) => (
                    <SlideBackground 
                        key={`bg-${i}`} 
                        img={v.img} 
                        index={i} 
                        total={values.length} 
                        scrollYProgress={scrollYProgress}
                        isLogo={v.isLogo}
                    />
                ))}

                {/* Advanced Cinematic Vignette Overlay */}
                <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(2,3,6,0.85) 100%), linear-gradient(0deg, rgba(2,3,6,1) 0%, transparent 20%, transparent 80%, rgba(2,3,6,1) 100%)",
                    zIndex: 2,
                    pointerEvents: "none"
                }} />

                {/* Subtle Cinematic Film Grain overlay */}
                <div className="grain-overlay" style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.25,
                    mixBlendMode: "overlay",
                    backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=\"0 0 200 200\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noiseFilter\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.75\" numOctaves=\"3\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"100%25\" height=\"100%25\" filter=\"url(%23noiseFilter)\"/%3E%3C/svg%3E')",
                    zIndex: 2,
                    pointerEvents: "none"
                }}></div>

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
                    <span style={{ fontSize: "0.75rem", letterSpacing: "4px", opacity: 0.6, marginBottom: "15px", textTransform: "uppercase", fontWeight: 700 }}>Enter the Dojo</span>
                    <motion.div 
                        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: "2px", height: "50px", background: "linear-gradient(to bottom, #d4af37, transparent)" }} 
                    />
                </motion.div>
            </div>
        </section>
    );
}

