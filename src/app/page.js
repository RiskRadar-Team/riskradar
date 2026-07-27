import Navbar from '../components/Navbar';
import Hero from '../components/Hero'
import Features from '../components/Features';
import HowItWorks from '@/components/HowItWorks';
import CTA from '../components/CTA'
import Footer from "@/components/Footer";

export default function Home () {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
