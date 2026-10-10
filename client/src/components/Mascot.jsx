import mascot from "../assets/mascot.webp";
import mascotWalk from "../assets/mascot-walk.mp4";
import mascotWave from "../assets/mascot-wave.mp4";


const Mascot = ({ className = "", animated = true }) => (
  <img
    src={mascot}
    alt="JobTrack mascot"
    className={`inline-block rounded-full object-cover ${
      animated ? "animate-mascot" : ""
    } ${className}`}
  />
);


export const MascotVideo = ({ className = "" }) => (
  <video
    src={mascotWalk}
    autoPlay
    loop
    muted
    playsInline
    disablePictureInPicture
    aria-label="JobTrack mascot walking"
    className={`inline-block rounded-full object-cover ${className}`}
    onContextMenu={(e) => e.preventDefault()}
  />
);


export const MascotWave = ({ className = "" }) => (
  <video
    src={mascotWave}
    autoPlay
    loop
    muted
    playsInline
    disablePictureInPicture
    controls={false}
    aria-label="JobTrack mascot waving hello"
    className={`inline-block rounded-full object-cover ${className}`}
    onContextMenu={(e) => e.preventDefault()}
  />
);

export default Mascot;
