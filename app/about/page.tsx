import { pageMetadata } from "@/lib/seo";
import { Logo } from "@/components/shell";
export const metadata = pageMetadata("An indie typing project", "Monkeytype Racer is a small independent typing project by Quentin, inspired by Monkeytype and TypeRacer.", "/about");
export default function AboutPage() {
  return (
    <div className="page-content">
      <div className="about-logo"><Logo /><span>monkeytype racer</span></div>
      <div className="about-intro">a little indie project.<br />a little friendly competition.</div>
      <div className="prose">
        <h2>made for the fun of typing</h2>
        <p>I’m Quentin. I’m building Monkeytype Racer as a small independent project: a quiet place to type, race a few friends, and try to beat your last run.</p>
        <p>It’s still growing. Feedback, bug reports, and a good race all help make it better.</p>
        <h2>standing on the shoulders of two favorites</h2>
        <p><a href="https://monkeytype.com" target="_blank" rel="noreferrer">Monkeytype</a> is the inspiration for the focused typing experience, customization, and minimal interface. Huge thanks to Miodec and the <a href="https://github.com/monkeytypegame/monkeytype" target="_blank" rel="noreferrer">Monkeytype contributors</a> for building it in the open. This project uses Monkeytype’s word lists, quote collections, themes, fonts, sounds, and design foundations, with their licenses and credits preserved.</p>
        <p><a href="https://play.typeracer.com" target="_blank" rel="noreferrer">TypeRacer</a> is the inspiration for racing the same quote together, watching everyone’s progress, and lining up for one more race. Credit to the TypeRacer team for making typing feel like a game you can share.</p>
        <p>Monkeytype Racer is an independent project, not an official Monkeytype or TypeRacer product. It is not affiliated with or endorsed by either team.</p>
        <h2>credits & licenses</h2>
        <p>Monkeytype’s contributions are credited under GPL-3.0, and third-party asset licenses are retained. Interface icons come from <a href="https://hugeicons.com" target="_blank" rel="noreferrer">Hugeicons</a>.</p>
        <h2 id="support">say hello</h2>
        <p>For support, bug reports, or feedback, email me at <a href="mailto:quentinromero@outlook.com">quentinromero@outlook.com</a>.</p>
        <p>Found a bug, have an idea, or want someone to race? Join the <a href="https://discord.gg/KJ75VN2pM" target="_blank" rel="noreferrer">Monkeytype Racer Discord</a>.</p>
      </div>
    </div>
  );
}
