import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import eggsPair from "../assets/eggs-pair.png";

gsap.registerPlugin(ScrollTrigger);

function EggsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Heading animation
      gsap.from(".eggs-heading > *", {
        scrollTrigger: {
          trigger: ".eggs-section",
          start: "top 75%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Left side notes
      gsap.from(".left-info .egg-note", {
        scrollTrigger: {
          trigger: ".eggs-display",
          start: "top 75%",
        },
        x: -60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Right side notes
      gsap.from(".right-info .egg-note", {
        scrollTrigger: {
          trigger: ".eggs-display",
          start: "top 75%",
        },
        x: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.2,
        ease: "power3.out",
      });

      // Egg image entrance
      gsap.from(".egg-center img", {
        scrollTrigger: {
          trigger: ".eggs-display",
          start: "top 75%",
        },
        scale: 0.7,
        rotation: -8,
        opacity: 0,
        duration: 1.3,
        ease: "back.out(1.5)",
      });

      // Egg image floating
      gsap.to(".egg-center img", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Egg labels
      gsap.from(".egg-labels > div", {
        scrollTrigger: {
          trigger: ".egg-labels",
          start: "top 90%",
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power2.out",
      });

      // Ampersand animation
      gsap.from(".egg-ampersand", {
        scrollTrigger: {
          trigger: ".egg-center",
          start: "top 75%",
        },
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="eggs" className="eggs-section" ref={sectionRef}>
      <div className="eggs-heading">
        <p className="meet-label">meet the eggs</p>

        <h2 className="eggs-title">
          Two shells. Same good egg.
        </h2>

        <p className="eggs-subtitle">
          The shell colour is just the breed of hen.
          The goodness inside is the same.
        </p>
      </div>

      <div className="eggs-display">

        <div className="egg-info left-info">
          <div className="egg-note">
            <span className="arrow">↙</span>
            <h3>Warm, rich shell</h3>
            <p>Naturally brown and farm fresh.</p>
          </div>

          <div className="egg-note">
            <span className="arrow">←</span>
            <h3>Natural freckles</h3>
            <p>A beautiful natural shell.</p>
          </div>

          <div className="egg-note">
            <span className="arrow">↙</span>
            <h3>Sunny yolk inside</h3>
            <p>Fresh goodness in every egg.</p>
          </div>
        </div>

        <div className="egg-center">
          <img src={eggsPair} alt="Brown and white eggs" />

          <span className="egg-ampersand">&</span>

          <div className="egg-labels">
            <div>
              <h3>The Brown One</h3>
              <p>Rich in nutrients. Naturally.</p>
            </div>

            <div>
              <h3>The White One</h3>
              <p>Pure goodness. Always.</p>
            </div>
          </div>
        </div>

        <div className="egg-info right-info">
          <div className="egg-note">
            <span className="arrow">↘</span>
            <h3>Classic white shell</h3>
            <p>Clean, simple and fresh.</p>
          </div>

          <div className="egg-note">
            <span className="arrow">→</span>
            <h3>Smooth as can be</h3>
            <p>A beautiful natural shell.</p>
          </div>

          <div className="egg-note">
            <span className="arrow">↘</span>
            <h3>Same good stuff</h3>
            <p>Fresh farm goodness.</p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default EggsSection;