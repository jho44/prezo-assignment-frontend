/* dropzone for draggable slides */
export default function Landing({ i, overlapping }) {
  return (
    <div id={`landing-${i + 1}`} class="landing-container">
      <div
        class="landing"
        style={{
          backgroundColor: overlapping ? "blueviolet" : null,
        }}
      />
    </div>
  );
}
