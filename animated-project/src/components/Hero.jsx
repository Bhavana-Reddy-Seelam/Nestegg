import { useEffect, useRef } from "react";
import gsap from "gsap";
import yolkHero from "../assets/yolk-hero.png";

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Heading animation
      gsap.from(".hero-text h1", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Paragraph animation
      gsap.from(".hero-description", {
        y: 40,
        opacity: 0,
        duration: 1,
        delay: 0.3,
      });

      // Button animation
      gsap.from(".hero-btn", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.6,
      });

      // Egg image animation
      gsap.from(".hero-artwork", {
        scale: 0.7,
        opacity: 0,
        duration: 1.2,
        ease: "back.out(1.5)",
      });

      // Floating animation
      gsap.to(".hero-artwork img", {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" ref={heroRef}>
      <div className="hero-text">
        <p className="small-text">FRESH FROM OUR FARM</p>

        <h1>
          Good eggs.
          <br />
          Better <span>mornings.</span>
        </h1>

        <p className="hero-description">
          Fresh, delicious eggs from our happy hens.
          <br />
          A little sunshine in every breakfast.
        </p>

        <button className="hero-btn">Meet the eggs →</button>
      </div>

      <div className="hero-artwork">
        <img src={yolkHero} alt="Fresh eggs" />
      </div>
    </section>
  );
}

export default Hero;