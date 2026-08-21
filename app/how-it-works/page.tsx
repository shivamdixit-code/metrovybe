import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

const steps = [
  {
    number: "01",
    title: "EXPLORE",
    text: "Discover places, services and experiences that fit your city life.",
  },
  {
    number: "02",
    title: "COMPARE",
    text: "Look through your options, check the details and find your best match.",
  },
  {
    number: "03",
    title: "CONNECT",
    text: "Reach out to local businesses and service providers when you're ready.",
  },
  {
    number: "04",
    title: "LIVE BETTER",
    text: "Get things done locally and discover more of what makes your city yours.",
  },
];

export default function How() {
  return (
    <div className="page mv-how-page">
      <Header />

      <main>
        <section className="mv-how-title-strip">
          <div className="shell">
            <h1>
              HOW IT
              <br />
              <span>WORKS.</span>
            </h1>

            <p>
              Four simple steps to discover your city and find your vybe.
            </p>
          </div>
        </section>

        <section className="shell mv-how-content">
          <div className="mv-how-intro-line">
            <span>YOUR CITY. YOUR VYBE.</span>
            <span>04 EASY STEPS</span>
          </div>

          <div className="mv-how-list">
            {steps.map((step) => (
              <article className="mv-how-card" key={step.number}>
                <div className="mv-how-card-top">
                  <span className="mv-how-number">{step.number}</span>
                  <span className="mv-how-card-star">✦</span>
                </div>

                <div className="mv-how-copy">
                  <h2>{step.title}</h2>
                  <p>{step.text}</p>
                </div>


              </article>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
