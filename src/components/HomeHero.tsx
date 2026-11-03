interface HomeHeroProps {
  onCoachClick: () => void;
  onPlayerClick: () => void;
}

const COACH_POINTS = [
  "Filter by position, region, and roster or portal status",
  "Sort by exit velo, peak fastball, Stuff+, and more",
  "Get player contact details and video once approved",
];

const PLAYER_POINTS = [
  "Post your hitting and pitching numbers for free",
  "Share your scout card with coaches",
  "Unlock brand intros and member discounts",
];

export default function HomeHero({ onCoachClick, onPlayerClick }: HomeHeroProps) {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <h1 id="home-hero-title">Find college ballplayers by the numbers.</h1>
      <p className="home-hero-lede">
        Players post their stats on one national scoreboard. Coaches and scouts search it, then reach out directly.
      </p>

      <div className="home-hero-paths">
        <div className="home-hero-path home-hero-path-coach">
          <h2>For coaches and scouts</h2>
          <ul>
            {COACH_POINTS.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <button type="button" className="home-hero-button-primary" onClick={onCoachClick}>Coach &amp; Scout Access</button>
        </div>

        <div className="home-hero-path">
          <h2>For players</h2>
          <ul>
            {PLAYER_POINTS.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <button type="button" className="home-hero-button-secondary" onClick={onPlayerClick}>Create Your Player Card</button>
        </div>
      </div>
    </section>
  );
}
