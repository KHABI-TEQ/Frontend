import NewHomepage from "@/components/new-homepage/NewHomepage";

/** Standalone landing without the user-type overlay. Must not import app/page or app/new-homepage/page. */
export default function HomeLandingPage() {
  return <NewHomepage showOverlayOnLoad={false} />;
}
