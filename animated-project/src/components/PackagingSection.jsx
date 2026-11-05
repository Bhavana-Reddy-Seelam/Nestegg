import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function PackagingSection() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  const [eggType, setEggType] = useState("White");

  const eggImages = {
    Brown: "/brown-10.png",
    White: "/white-10.png",
  };

  // PACKAGING SECTION ANIMATION

  useEffect(() => {
    const ctx = gsap.context(() => {

      gsap.from(".packaging-info > *", {
        x: -50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".packaging-section",
          start: "top 75%",
        },
      });

      gsap.from(".packing-step", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".packing-steps",
          start: "top 85%",
        },
      });

      gsap.from(".packaging-image", {
        x: 70,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".packaging-image",
          start: "top 80%",
        },
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // IMAGE CHANGE ANIMATION

  useEffect(() => {
    gsap.fromTo(
      imageRef.current,
      {
        opacity: 0,
        scale: 0.85,
        rotation: -5,
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 0.7,
        ease: "back.out(1.5)",
      }
    );
  }, [eggType]);

  return (
    <section
      className="packaging-section"
      ref={sectionRef}
    >

      <div className="packaging-content">

        {/* PACKAGING INFORMATION */}

        <div className="packaging-info">

          <p className="packaging-label">
            WHAT YOU'LL RECEIVE
          </p>

          <h2>
            Your eggs,
            <br />
            boxed with <span>care.</span>
          </h2>

          <p className="packaging-description">
            Every order is packed in our moulded-pulp carton
            and sealed with our sticker. This is what lands
            on your doorstep.
          </p>

          {/* EGG TYPE BUTTONS */}

          <div className="packaging-toggle">

            <button
              className={eggType === "Brown" ? "active" : ""}
              onClick={() => setEggType("Brown")}
            >
              Brown
            </button>

            <button
              className={eggType === "White" ? "active" : ""}
              onClick={() => setEggType("White")}
            >
              White
            </button>

          </div>

          {/* PACKING STEPS */}

          <div className="packing-steps">

            <div className="packing-step">

              <span>1</span>

              <div>
                <h3>Ten good eggs</h3>
                <p>
                  Your pick of the flock, each one settled into its own cup.
                </p>
              </div>

            </div>

            <div className="packing-step">

              <span>2</span>

              <div>
                <h3>Closed up snug</h3>
                <p>
                  Each egg stays safely tucked away for its journey.
                </p>
              </div>

            </div>

            <div className="packing-step">

              <span>3</span>

              <div>
                <h3>Sealed with our sticker</h3>
                <p>
                  Freshness, carefully packed, all the way to your home.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* PACKAGING IMAGE */}

        <div className="packaging-image">

          <img
            ref={imageRef}
            src={eggImages[eggType]}
            alt={`${eggType} eggs packaging`}
          />

        </div>

      </div>

    </section>
  );
}

export default PackagingSection;