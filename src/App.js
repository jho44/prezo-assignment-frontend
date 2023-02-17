import { useState, useEffect } from "react";
import Landing from "./Landing";
import "./App.css";

function App() {
  const [slides, setSlides] = useState([
    {
      id: "1",
      title: "Slide 1",
    },
    {
      id: "2",
      title: "Slide 2",
    },
    {
      id: "3",
      title: "Slide 3",
    },
    {
      id: "4",
      title: "Slide 4",
    },
    {
      id: "5",
      title: "Slide 5",
    },
    {
      id: "6",
      title: "Slide 6",
    },
    {
      id: "7",
      title: "Slide 7",
    },
    {
      id: "8",
      title: "Slide 8",
    },
    {
      id: "9",
      title: "Slide 9",
    },
    {
      id: "10",
      title: "Slide 10",
    },
  ]);

  // the offset from the mouse's position to a slide's edges
  const [evtOffset, setEvtOffset] = useState(null);

  // the index of the Landing that the dragged slide is overlapping with
  // -1 by default (i.e., none)
  const [overlapping, setOverlapping] = useState(-1);

  // how many pixels the slide container has been scrolled down
  const [scrollTop, setScrollTop] = useState(0);

  // the window size
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  // the bounding client rectangle of each Landing
  const [landingPositions, setLandingPositions] = useState([]);

  /**
   * after initial render, subscribe to the window resize event
   * and initialize landingPositions to a non-empty array
   */
  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);

    getLandingPositions();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /**
   * update the landingPositions every time the user has scrolled
   * or the window has resized
   */
  useEffect(() => {
    getLandingPositions();
  }, [scrollTop, dimensions.height, dimensions.width]);

  /**
   * upon dragging a slide, create a clone node of said slide and
   * hide it outside of the viewport so any drag ghost images of
   * partially visible slides are whole
   */
  function onDragStart(e) {
    let crt = e.target.cloneNode(true);
    crt.id = "scratch";
    crt.style.width = `${e.target.offsetWidth}px`;
    crt.style.height = `${e.target.offsetHeight}px`;
    crt.style.position = "absolute";
    crt.style.top = "0px";
    crt.style.left = "-100vw";
    document.body.appendChild(crt);
    e.dataTransfer.setDragImage(
      crt,
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
    e.dataTransfer.setData("text", e.target.id);
  }

  /**
   * the first valaue of e.native.offsetX/Y is the offset of the
   * mouse's position from the slide's edges
   * use that and e.clientX/Y to compare the slide's edges to
   * Landing edges and sense overlap
   */
  function onDrag(e) {
    if (!evtOffset)
      setEvtOffset([e.nativeEvent.offsetX, e.nativeEvent.offsetY]);

    if (evtOffset != null) {
      const l = e.clientX - evtOffset[0];
      const r = l + e.target.clientWidth;
      const t = e.clientY - evtOffset[1];
      const b = t + e.target.clientHeight;

      const n = landingPositions.length;
      let overlap = false;
      for (let i = 0; i < n; i++) {
        const landingPosition = landingPositions[i];
        const posWidth =
          Math.min(r, landingPosition.right) >
          Math.max(l, landingPosition.left);
        const posHeight =
          Math.min(b, landingPosition.bottom) >
          Math.max(t, landingPosition.top);
        if (posWidth && posHeight) {
          setOverlapping(i);
          overlap = true;
          break;
        }
      }
      // check if l and t revert back to evtOffset since it does this
      // upon letting go of the slide without dropping it into a dropzone
      // but this doesn't mean that the slide and Landing aren't overlapping
      if (!overlap && l !== -evtOffset[0] && t !== -evtOffset[1]) {
        setOverlapping(-1);
      }
    }
  }

  /*
   * to prevent the default drag ghost image
   */
  function onDragOver(e) {
    e.preventDefault();
  }

  /**
   * called after letting go of dragged slide
   * get rid of cloned node (for drag ghost image)
   * update slides array if the slide had overlapped a Landing zone
   * and reset states as necessary
   */
  function onDragEnd(e) {
    const scratchElem = document.getElementById("scratch");
    if (scratchElem) document.body.removeChild(scratchElem);

    if (overlapping !== -1) {
      const slideId = parseInt(e.target.id.split("-")[1]);
      const landingId = overlapping;

      if (landingId === -1) return;

      const slide = slides[slideId];
      slides.splice(slideId, 1);
      if (slideId < landingId) {
        // everything moved up by one after slideId so we need to account for that
        slides.splice(landingId - 1, 0, slide);
      } else {
        slides.splice(landingId, 0, slide);
      }

      setSlides([...slides]);
      setOverlapping(-1);
    }
    setEvtOffset(null);
  }

  /**
   * iterates through Landings to get their bounding client rects
   */
  function getLandingPositions() {
    const landings = document.querySelectorAll(".landing-container");
    const n = landings.length;
    let tmp = [];
    for (let i = 0; i < n; i++) {
      tmp.push(landings[i].getBoundingClientRect());
    }
    setLandingPositions(tmp);
  }

  /**
   * updates how many pixels the slide container has been scrolled down
   */
  function onScroll(e) {
    setScrollTop(e.target.scrollTop);
  }

  return (
    <div class="container" onDragOver={onDragOver}>
      <div class="slide-container" onScroll={onScroll}>
        <div class="slide-inner-container">
          <Landing
            i={-1}
            overlapping={overlapping === 0}
            style={{ marginTop: 9 }}
          />
          {slides.map((slide, i) => (
            <>
              <div
                class="slide"
                id={`slide-${i}`}
                key={`slide-${i}`}
                draggable="true"
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
              >
                {slide.title}
              </div>
              <Landing
                i={i}
                overlapping={overlapping === i + 1}
                key={`landing-${i}`}
              />
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
