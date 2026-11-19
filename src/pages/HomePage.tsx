import Hero from "../components/sections/Hero";
import About from "../components/sections/About";
import Marquee from "../components/sections/Marquee";
import FeaturedProjects from "../components/sections/FeaturedProjects";
import Skills from "../components/sections/Skills";
import Experience from "../components/sections/Experience";
import Contact from "../components/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Marquee />
      <FeaturedProjects />
      <Skills />
      <Experience />
      <Contact />
    </>
  );
}
