'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

const values = [
    { text: "DISCIPLINE", img: "/gallery/In Dojo.jpeg", pos: "center 25%" },
    { text: "INCLUSION", img: "/gallery/IMG_1191.JPG.jpeg", pos: "center 30%" },
    { text: "SPIRIT", img: "/gallery/Karate Demonstration2 starred.jpeg", pos: "center 20%" },
    { text: "EXCELLENCE", img: "/gallery/Tournment8 starred.jpeg", pos: "center 20%" },
    { text: "RESPECT", img: "/gallery/Tournment.jpeg", pos: "center 25%" },
    { text: "PASSION", img: "/gallery/Train the Elite - Training Camp starred.jpeg", pos: "center 20%" },
    { text: "FAMILY", img: "/gallery/In dojo 2 starred.jpeg", pos: "center 25%" },
    { text: "HERE WE ARE", img: "/logo/SKF logo.png", isLogo: true }
];

function SlideBackground({ img, text, index, total, scrollYProgress, isLogo, pos }) {
    const start = index / total;
    const duration = 1 / total;
    const end = start + duration;

    // Fast cinematic crossfade for regular photos
    const fadeInEnd = start + duration * 0.15;
    const opacity = index === 0 
        ? 1 
        : useTransform(scrollYProgress, [start, fadeInEnd], [0, 1]);

    const scale = useTransform(scrollYProgress, [start, end], [1.1, 1]);

    if (isLogo) {
        // --- FINAL SLIDE MASTERPIECE LOGIC ---
        // Text fades in smoothly later in the scroll
        const textReadyIn = start + duration * 0.35;
        const textReadyFull = start + duration * 0.65;
        const textOpacity = useTransform(scrollYProgress, [textReadyIn, textReadyFull], [0, 1]);
        const textY = useTransform(scrollYProgress, [textReadyIn, textReadyFull], ["20px", "-20px"]);
        
        // Background turns to a deep cinematic crimson glow smoothly over the same duration as text
        const bgOpacity = useTransform(scrollYProgress, [start, textReadyFull], [0, 1]);

        // Logo starts large and scales into its resting position
        const logoScale = useTransform(scrollYProgress, [start, start + duration * 0.8], [1.2, 1]);
        const logoOpacity = useTransform(scrollYProgress, [start, start + duration * 0.2], [0, 1]);
        
        const trackingProgress = useTransform(scrollYProgress, [textReadyIn, end], [0.2, 1]);
        const letterSpacing = useTransform(trackingProgress, (v) => `${v}vw`);

        return (
            <motion.div 
                style={{
                    position: "absolute",
                    inset: 0,
                    opacity: bgOpacity,
                    zIndex: index + 1,
                    display: "flex", // TRUE FLEXBOX guarantees no overlap!
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    // Thematic crimson/dark aura with transparent center hole - vastly softer memory feel
                    background: "radial-gradient(circle at center, rgba(139, 0, 0, 0.05) 0%, rgba(2, 3, 6, 0.6) 60%, rgba(0, 0, 0, 0.85) 100%)",
                    gap: "1.5vh"
                }}
            >
                {/* Subtle thematic gold glow behind the logo */}
                <div style={{
                    position: "absolute",
                    width: "40vw",
                    height: "40vw",
                    background: "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 60%)",
                    pointerEvents: "none"
                }} />

                <motion.div style={{ position: "relative", width: "65vmin", height: "65vmin", maxWidth: "450px", scale: logoScale, opacity: logoOpacity }}>
                    <Image 
                        src={img}
                        alt="SKF Logo"
                        fill
                        sizes="(max-width: 768px) 75vmin, 60vmin"
                        style={{ objectFit: "contain", objectPosition: "center", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.8))" }}
                        quality={100}
                        priority
                    />
                </motion.div>

                <motion.h2 
                    style={{
                        opacity: textOpacity,
                        y: textY,
                        letterSpacing,
                        margin: 0,
                        textAlign: "center",
                        fontWeight: 900,
                        color: "transparent",
                        backgroundImage: "linear-gradient(to right, #ffb703, #e85d04)",
                        WebkitBackgroundClip: "text",
                        fontSize: "clamp(1.5rem, 6vw, 6rem)", // pure 6vw scaling guarantees 11 letters fit in mobile
                        fontFamily: "var(--font-heading)",
                        textTransform: "uppercase",
                        textShadow: "none", // Eradicates VR ghosting bleeding completely
                        padding: "0 5vw", // horizontal padding mapped to screen width
                        whiteSpace: "nowrap" // Prevents awkward line-breaks on small mobiles!
                    }}
                >
                    {text}
                </motion.h2>
            </motion.div>
        );
    }

    // Normal slide rendering
    return (
        <motion.div 
            style={{
                position: "absolute",
                inset: 0,
                opacity,
                willChange: "opacity",
                zIndex: index + 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent"
            }}
        >
            <motion.div style={{ position: "absolute", inset: 0, scale, willChange: "transform" }}>
                <Image 
                    src={img}
                    alt=""
                    fill
                    sizes="100vw"
                    style={{ objectFit: "cover", objectPosition: pos || "center" }}
                    quality={90}
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                />
            </motion.div>
        </motion.div>
    );
}

function SlideText({ text, index, total, scrollYProgress, isLogo }) {
    if (isLogo) return null; // Controlled explicitly inside SlideBackground!

    const start = index / total;
    const duration = 1 / total;
    const end = start + duration;
    const isFirst = index === 0;

    const fadeInStart = isFirst ? 0 : start;
    const fadeInEnd = isFirst ? duration * 0.1 : start + duration * 0.15;
    const fadeOutStart = end;
    const fadeOutEnd = end + duration * 0.15;

    const opInput = [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd];
    const opOutput = [0, 1, 1, 0];
    const yInput = [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd];
    const yOutput = ["40px", "0px", "0px", "-40px"];

    const opacity = useTransform(scrollYProgress, opInput, opOutput);
    const y = useTransform(scrollYProgress, yInput, yOutput);
    
    // Dynamic viewport-responsive tracking to ensure text doesn't overflow mobile boundaries
    const trackingProgress = useTransform(scrollYProgress, [start, end], [0.1, 1.2]);
    const letterSpacing = useTransform(trackingProgress, (v) => `${v}vw`);

    return (
        <motion.div
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100, 
                pointerEvents: "none",
                padding: "0 5vw"
            }}
        >
            <motion.h2 
                style={{
                    opacity,
                    y,
                    letterSpacing,
                    willChange: "transform, opacity",
                    margin: 0,
                    textAlign: "center",
                    fontWeight: 900,
                    color: "rgba(255, 255, 255, 0.95)",
                    fontSize: "clamp(1.5rem, 8vw, 7rem)",
                    fontFamily: "var(--font-heading)",
                    textTransform: "uppercase",
                    textShadow: "0 10px 40px rgba(0,0,0,0.9)",
                    whiteSpace: "nowrap"
                }}
            >
                {text}
            </motion.h2>
        </motion.div>
    );
}

export default function CinematicValues() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const indicatorOpacity = useTransform(scrollYProgress, [0.02, 0.05], [1, 0]);

    return (
        <section ref={containerRef} className="cinematic-values-wrapper" style={{ height: "1200vh", position: "relative", background: "#020306" }}>
            <div className="cinematic-values-sticky" style={{ height: "100vh", position: "sticky", top: 0, overflow: "hidden" }}>
                
                {/* Unified Background Images Ecosystem */}
                <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                    {values.map((v, i) => (
                        <SlideBackground 
                            key={`bg-${i}`} 
                            img={v.img}
                            text={v.text}
                            index={i} 
                            total={values.length} 
                            scrollYProgress={scrollYProgress}
                            isLogo={v.isLogo}
                        />
                    ))}
                </div>

                {/* Constant Immersive Deep Vignette Overlay */}
                <div style={{ 
                    position: "absolute", 
                    inset: 0, 
                    background: "radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(2,3,6,0.65) 100%), linear-gradient(0deg, rgba(2,3,6,0.95) 0%, transparent 20%, transparent 80%, rgba(2,3,6,0.95) 100%)",
                    zIndex: 2,
                    pointerEvents: "none"
                }} />

                {/* Highly-Organized Distinct Text Layer */}
                <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
                    {values.map((v, i) => (
                        <SlideText 
                            key={`text-${i}`} 
                            text={v.text} 
                            index={i} 
                            total={values.length} 
                            scrollYProgress={scrollYProgress} 
                            isLogo={v.isLogo}
                        />
                    ))}
                </div>

                {/* Refined Geometric Scroll Indicator */}
                <motion.div 
                    style={{ 
                        position: "absolute", 
                        bottom: "40px", 
                        left: "50%", 
                        x: "-50%", 
                        zIndex: 20, 
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
                        animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }} 
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        style={{ width: "2px", height: "50px", background: "linear-gradient(to bottom, #d4af37, transparent)" }} 
                    />
                </motion.div>
            </div>
        </section>
    );
}
