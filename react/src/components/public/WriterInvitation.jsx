import { Link } from "react-router-dom";
import { ArrowRight, Check, Feather, FileText } from "lucide-react";
import PublicLayout from "./PublicLayout";

export default function WriterInvitation() {
  return (
    <PublicLayout className="pf-writer-entry">
      <div className="pf-container pf-writer-intro">
        <div>
          <span className="pf-kicker">FOR THE WORLD ONLY YOU CAN WRITE.</span>
          <h1>
            A little idea.
            <br />
            An entire <em>universe.</em>
          </h1>
          <p>
            Keep your chapters, characters, and all the possibilities in one
            place. Give the story in your head a home.
          </p>
          <Link className="pf-button pf-button-gold" to="/auth?mode=signup">
            Create your writing space
            <ArrowRight size={18} />
          </Link>
          <Link className="pf-inline-link" to="/auth">
            Already have an account? Log in
            <ArrowRight size={15} />
          </Link>
        </div>
        <div className="pf-writer-paper">
          <span>
            <Feather size={17} /> A story of your own
          </span>
          <h2>
            Once upon
            <br />
            <em>a possibility.</em>
          </h2>
          <p>
            The first sentence doesn’t have to be perfect.
            <br />
            It just has to be yours.
          </p>
          <div className="pf-paper-rules" />
          <span>
            <FileText size={14} /> Chapter one · A beginning
          </span>
        </div>
      </div>
      <div className="pf-container pf-writer-points">
        <span>
          <Check size={17} /> Write, chapter by chapter.
        </span>
        <span>
          <Check size={17} /> Build the world behind the words.
        </span>
        <span>
          <Check size={17} /> Publish when you’re ready.
        </span>
      </div>
    </PublicLayout>
  );
}
