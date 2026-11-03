interface HomeHeroProps {
  brandCount: number;
  onJoinClick: () => void;
  onBrandsClick: () => void;
  onCoachClick: () => void;
}

export default function HomeHero({ brandCount, onJoinClick, onBrandsClick, onCoachClick }: HomeHeroProps) {
  const perks = [
    { title: "Brand deals", text: `Request direct intros and unlock member perks from ${brandCount} brand partners.` },
    { title: "Gear drops", text: "Members can enter giveaways and partner gear drops announced on the site." },
    { title: "Your player card", text: "Post your numbers, share your card, and get seen by coaches and scouts." },
  ];

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <h1 id="home-hero-title">Built for college ballplayers.</h1>
      <p className="home-hero-lede">
        Connect with brands, get in on gear drops, and put your numbers on a national scoreboard. It&apos;s free to join.
      </p>

      <div className="home-hero-actions">
        <button type="button" className="home-hero-button-primary" onClick={onJoinClick}>Create Your Player Card</button>
        <button type="button" className="home-hero-button-secondary" onClick={onBrandsClick}>See Brand Deals</button>
      </div>

      <div className="home-hero-perks">
        {perks.map((perk) => (
          <div key={perk.title} className="home-hero-perk">
            <h2>{perk.title}</h2>
            <p>{perk.text}</p>
          </div>
        ))}
      </div>

      <p className="home-hero-coach">
        Coach or scout? <button type="button" onClick={onCoachClick}>Request access to player contact details</button>
      </p>
    </section>
  );
}
