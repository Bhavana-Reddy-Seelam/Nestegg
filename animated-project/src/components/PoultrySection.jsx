import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function PoultrySection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".poultry-image", {
        scrollTrigger: {
          trigger: ".poultry-section",
          start: "top 70%",
        },
        x: -150,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });

      gsap.from(".poultry-content", {
        scrollTrigger: {
          trigger: ".poultry-section",
          start: "top 70%",
        },
        x: 150,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="poultry-section" ref={sectionRef}>
      <div className="poultry-image">
        <div className="poultry-circle">
          <span>🐔</span>
        </div>
      </div>

      <div className="poultry-content">
        <p className="section-label">OUR POULTRY</p>

        <h2>
          Happy hens.
          <br />
          Better eggs.
        </h2>

        <p>
          We believe happy hens make better eggs. Our flock
          is cared for with attention, fresh food and plenty
          of space to roam.
        </p>

        <button className="poultry-btn">
          Meet our flock
        </button>
      </div>
    </section>
  );
}

export default PoultrySection;