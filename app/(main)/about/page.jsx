'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Container from "@/components/ui/Container";
import BackLink from "@/components/ui/BackLink";
import Button from "@/components/ui/Button";
import { ArrowRight, Target, Users, ShieldCheck, Zap } from 'lucide-react';
import Marquee from "@/components/ui/Marquee";
import clsx from 'clsx';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

const stats = [
    { label: "Design Professionals", value: "15,000+" },
    { label: "Premium Brands", value: "500+" },
    { label: "Products Cataloged", value: "1M+" },
    { label: "Projects Completed", value: "8,500+" },
];

const values = [
    {
        icon: <Target className="w-8 h-8" />,
        title: "Precision First",
        description: "We verify every specification, ensuring what you see is exactly what gets built."
    },
    {
        icon: <Users className="w-8 h-8" />,
        title: "Community Driven",
        description: "Built by architects for architects. We understand the workflow because we've lived it."
    },
    {
        icon: <ShieldCheck className="w-8 h-8" />,
        title: "Uncompromising Quality",
        description: "We curate only the best manufacturers and products that meet global standards."
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Innovation Speed",
        description: "Constantly evolving our platform to keep pace with the dynamic world of design."
    }
];

const marqueeItems = [
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">Gensler</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">Foster + Partners</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">Perkins&Will</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">Zaha Hadid Architects</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">HOK</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#d9a88a] opacity-80 uppercase tracking-tighter">SOM</span>,
    <span className="text-3xl md:text-5xl font-bold text-[#373a40] opacity-20 uppercase tracking-tighter">•</span>,
];

// ... imports

// Animated Blob Component
const Blob = ({ className }) => (
    <motion.div
        className={clsx("absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob", className)}
        animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, -20, 0],
            y: [0, -50, 20, 0],
        }}
        transition={{
            duration: 7,
            repeat: Infinity,
            repeatType: "reverse"
        }}
    />
);

export default function AboutPage() {
    return (
        <>
            <main className="bg-white overflow-hidden text-[#373a40]">

                {/* HERO SECTION */}
                <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 overflow-hidden bg-[#f9fafb]">
                    {/* BLUEPRINT GRID */}
                    <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />

                    {/* Background Blobs - Random Bullshit Go! */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <Blob className="w-96 h-96 bg-[#d9a88a]/30 -top-20 -left-20" />
                        <Blob className="w-96 h-96 bg-blue-100/50 top-40 -right-20 animation-delay-2000" />
                        <Blob className="w-72 h-72 bg-purple-100/40 -bottom-8 left-1/2 animation-delay-4000" />
                    </div>

                    <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 L100 0 L100 100 Z" fill="#373a40" />
                        </svg>
                    </div>

                    <Container className="relative z-10">
                        {/* ... existing content ... */}
                        <div className="mb-6">
                            <BackLink useRouterBack={true} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl"
                        >
                            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#373a40] tracking-tight leading-[1.1] mb-8 relative">
                                Building the <span className="text-[#d9a88a] relative inline-block">
                                    future
                                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#d9a88a] opacity-40" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                                    </svg>
                                </span> of <br />
                                design and sourcing.
                            </h1>
                            <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl leading-relaxed">
                                ArcMat bridges the gap between visionary architects and world-class manufacturers, creating a seamless ecosystem for creative excellence.
                            </p>
                        </motion.div>
                    </Container>
                </section>

                {/* SCROLLING TEXT STRIP - Random Visual Noise */}
                <div className="py-4 bg-[#373a40] overflow-hidden">

                    <Marquee
                        items={[
                            <span className="text-6xl font-bold text-transparent stroke-text">INNOVATION</span>,
                            <span className="text-6xl font-bold text-[#d9a88a]/40">DESIGN</span>,
                            <span className="text-6xl font-bold text-transparent stroke-text">PRECISION</span>,
                            <span className="text-6xl font-bold text-[#d9a88a]/40">QUALITY</span>,
                            <span className="text-6xl font-bold text-transparent stroke-text">FUTURE</span>,
                        ]}
                        speed={15}
                    />
                </div>

                {/* IMAGE BREAK */}
                {/* ... existing image break ... */}
                {/* ARCHITECTURAL DETAIL COMPOSITION */}
                <section className="py-20 bg-white">
                    <Container>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[600px] md:h-[700px]"
                        >
                            {/* Main Image - Materiality */}
                            <div className="md:col-span-8 relative h-full rounded-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop"
                                    alt="Architectural Materiality"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute bottom-6 left-6 z-20">
                                    <span className="text-white/80 text-xs font-mono tracking-widest uppercase mb-1 block">Texture</span>
                                    <span className="text-white text-xl font-bold">Materiality defined.</span>
                                </div>
                            </div>

                            {/* Side Stack */}
                            <div className="md:col-span-4 flex flex-col gap-4 h-full">
                                {/* Top - Space */}
                                <div className="relative flex-1 rounded-2xl overflow-hidden group">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                                    <img
                                        src="https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt="Light and Shadow"
                                        className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <span className="text-white/80 text-xs font-mono tracking-widest uppercase mb-1 block">Contrast</span>
                                        <span className="text-white text-lg font-bold">Light & form.</span>
                                    </div>
                                </div>
                                {/* Bottom - Detail */}
                                <div className="relative flex-1 rounded-2xl overflow-hidden group">
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                                    <img
                                        src="https://images.unsplash.com/photo-1768039049615-4663525f440c?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        alt="Technical Detail"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-6 left-6 z-20">
                                        <span className="text-white/80 text-xs font-mono tracking-widest uppercase mb-1 block">Precision</span>
                                        <span className="text-white text-lg font-bold">Structural balance.</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </Container>
                </section>

                {/* MARQUEE */}
                <div className="py-12 border-y border-gray-100 bg-white">
                    <Marquee items={marqueeItems} speed={30} />
                </div>

                {/* ... rest of the sections ... */}


                {/* OUR STORY */}
                <section className="py-20 lg:py-32">
                    <Container>
                        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <motion.div {...fadeInUp}>
                                <h2 className="text-sm font-bold tracking-widest text-[#d9a88a] uppercase mb-4">Our Story</h2>
                                <h3 className="text-3xl sm:text-4xl font-semibold text-[#373a40] mb-6">Born from frustration, <br />built for precision.</h3>
                                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                                    <p>
                                        In 2018, two architects sat in a clutter of material samples and outdated catalogs. They realized that while design tools were advancing, the sourcing process was stuck in the past.
                                    </p>
                                    <p>
                                        They envisioned a platform that wasn't just a directory, but a highly curated, technical, and visual ecosystem. A place where specs are accurate, files are ready, and inspiration is endless.
                                    </p>
                                    <p>
                                        Today, ArcMat is that reality—empowering thousands of professionals to obtain what they need, exactly when they need it.
                                    </p>
                                </div>

                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#f5f0eb] rounded-full z-0" />
                                <img
                                    src="https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800&q=80"
                                    alt="Founder working"
                                    className="relative z-10 rounded-2xl shadow-2xl w-full"
                                />
                            </motion.div>
                        </div>

                    </Container>
                </section>



                {/* STATS */}
                <section className="py-20 bg-[#373a40] text-white">
                    <Container>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="text-4xl sm:text-5xl font-bold text-[#d9a88a] mb-2">{stat.value}</div>
                                    <div className="text-sm sm:text-base text-gray-300 tracking-wide">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* CORE VALUES */}
                <section className="py-20 lg:py-32 bg-[#f9fafb]">
                    <Container>
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <motion.h2 {...fadeInUp} className="text-sm font-bold tracking-widest text-[#d9a88a] uppercase mb-4">Our Values</motion.h2>
                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-3xl sm:text-4xl font-bold text-[#373a40]"
                            >
                                What drives us forward.
                            </motion.h3>
                        </div>

                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {values.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={fadeInUp}
                                    className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 group cursor-default"
                                >
                                    <div className="mb-6 bg-[#f5f0eb] w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-[#d9a88a] transition-colors duration-300">
                                        <div className="text-[#d9a88a] group-hover:text-white transition-colors duration-300">
                                            {item.icon}
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-[#373a40] mb-3 group-hover:text-[#d9a88a] transition-colors duration-300">{item.title}</h4>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {item.description}
                                    </p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </Container>
                </section>

                {/* REGIONAL PRESENCE */}
                <section className="py-20 lg:py-32 bg-[#373a40] text-white relative overflow-hidden">
                    {/* Abstract Map Background */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
                            <path d="M400,200 Q450,150 500,200 T600,200" stroke="white" strokeWidth="2" fill="none" opacity="0.5" />
                            {/* Simple abstract dots representing NCR region */}
                            <circle cx="500" cy="200" r="80" fill="white" className="animate-pulse" /> {/* Delhi NCR */}
                            {/* Connecting Lines */}
                            <line x1="450" y1="180" x2="550" y2="220" stroke="white" strokeWidth="1" strokeDasharray="5,5" opacity="0.3" />
                        </svg>
                    </div>

                    <Container className="relative z-10">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <motion.div {...fadeInUp}>
                                <h2 className="text-sm font-bold tracking-widest text-[#d9a88a] uppercase mb-4">Regional Presence</h2>
                                <h3 className="text-3xl sm:text-5xl font-bold mb-6">Serving Delhi <br />NCR with pride.</h3>
                                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                                    Based in the heart of Delhi NCR, we connect architects and designers across Gurugram, Noida, Ghaziabad, and Faridabad with premium materials and trusted manufacturers.
                                </p>
                                <div className="flex gap-8">
                                    <div>
                                        <div className="text-4xl font-bold text-[#d9a88a]">500+</div>
                                        <div className="text-sm text-gray-400 uppercase tracking-wider mt-1">Projects</div>
                                    </div>
                                    <div>
                                        <div className="text-4xl font-bold text-[#d9a88a]">NCR</div>
                                        <div className="text-sm text-gray-400 uppercase tracking-wider mt-1">Coverage</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stylized Map Visual */}
                            <div className="relative h-[300px] md:h-[400px] w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 flex items-center justify-center">
                                <span className="absolute top-4 left-4 text-xs font-mono text-white/40">LAT: 28.7041° N</span>
                                <span className="absolute bottom-4 right-4 text-xs font-mono text-white/40">LNG: 77.1025° E</span>

                                <div className="relative w-full h-full">
                                    {/* Abstract Nodes - Delhi NCR */}
                                    {/* Delhi */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#d9a88a] rounded-full animate-ping" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-[#d9a88a] rounded-full" />
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-6 text-sm font-bold whitespace-nowrap">Delhi</span>

                                    {/* Gurugram */}
                                    <div className="absolute top-2/3 left-1/3 w-3 h-3 bg-white rounded-full animate-pulse" />
                                    <span className="absolute top-2/3 left-1/3 ml-5 -mt-2 text-xs text-gray-300">Gurugram</span>

                                    {/* Noida */}
                                    <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                                    <span className="absolute top-1/3 right-1/3 ml-5 -mt-2 text-xs text-gray-300">Noida</span>

                                    {/* Ghaziabad */}
                                    <div className="absolute top-1/4 left-2/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
                                    <span className="absolute top-1/4 left-2/3 ml-4 -mt-2 text-xs text-gray-300">Ghaziabad</span>

                                    {/* Faridabad */}
                                    <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                                    <span className="absolute bottom-1/4 left-1/2 ml-4 -mt-2 text-xs text-gray-300">Faridabad</span>

                                    {/* Connecting lines SVG overlay */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                        <path d="M250 200 Q 300 150 350 200" stroke="white" strokeWidth="1" fill="none" strokeDasharray="4 4" className="opacity-20" />
                                        <circle cx="250" cy="200" r="120" stroke="white" strokeWidth="1" fill="none" strokeDasharray="8 4" className="opacity-10" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Container>
                </section>

                {/* CTA - Parallax */}
                <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                    {/* Parallax Background */}
                    <div
                        className="absolute inset-0 z-0 bg-fixed bg-center bg-cover bg-no-repeat"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=900&fit=crop")',
                        }}
                    >
                        <div className="absolute inset-0 bg-[#373a40]/80 backdrop-blur-sm" />
                    </div>

                    <Container className="relative z-10 text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl mx-auto"
                        >
                            <h2 className="text-4xl sm:text-7xl font-bold text-white mb-8 tracking-tight">
                                Ready to build <br /> <span className="text-[#d9a88a]">better?</span>
                            </h2>
                            <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Join a community of forward-thinking professionals and define the future of architectural sourcing.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button
                                    href="/auth/register"
                                    text="Get Started Free"
                                    className="bg-[#d9a88a] text-white hover:bg-[#c99775] px-12 py-5 text-xl shadow-2xl hover:shadow-orange-500/20 transition-all rounded-full"
                                />
                                <Button
                                    href="/contact-us"
                                    text="Contact Sales"
                                    className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 px-12 py-5 text-xl backdrop-blur-md rounded-full"
                                />
                            </div>
                        </motion.div>
                    </Container>
                </section>

            </main>
        </>
    );
}
