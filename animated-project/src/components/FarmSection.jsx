import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function FarmSection() {
  const sectionRef = useRef(null);

  // FARM SECTION ANIMATIONS

  useEffect(() => {
    const ctx = gsap.context(() => {

      // HEADING ANIMATION

      gsap.from(".farm-heading > *", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".farm-heading",
          start: "top 80%",
        },
      });

      // FARM IMAGE ANIMATION

      gsap.from(".farm-card", {
        y: 70,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        stagger: 0.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".farm-images",
          start: "top 85%",
        },
      });

      // IMAGE ZOOM ANIMATION

      gsap.from(".farm-card img", {
        scale: 1.15,
        duration: 1.2,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".farm-images",
          start: "top 85%",
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      className="farm-section"
      ref={sectionRef}
    >

      {/* FARM HEADING */}

      <div className="farm-heading">

        <p>WHERE IT ALL BEGINS</p>

        <h2>
          Behind the <span>eggs.</span>
        </h2>

        <p>
          Good eggs start with happy hens and a place they can call home.
        </p>

      </div>

      {/* FARM IMAGES */}

      <div className="farm-images">

        <div className="farm-card">

          <img
            src="/farm.png"
            alt="Our farm"
          />

          <h3>THE FARM</h3>

        </div>

        <div className="farm-card">

          <img
            src="/inside-farm.png"
            alt="Inside our farm"
          />

          <h3>FOOD PROVIDNG PROCESS</h3>

        </div>

      </div>

    </section>
  );
}

export default FarmSection;