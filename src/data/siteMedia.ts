import type { ImageMetadata } from "astro";
import heroTherapy from "../assets/hero-terapia.jpg";
import therapeuticSpace from "../assets/espacio-terapeutico.jpg";
import activePlay from "../assets/legacy/active-play.jpg";
import ballPit from "../assets/legacy/ball-pit.jpg";
import climbingPlay from "../assets/legacy/climbing-play.jpg";
import familyBallPit from "../assets/legacy/family-ball-pit.jpg";
import movementSession from "../assets/legacy/movement-session.jpg";
import sensoryRice from "../assets/legacy/sensory-rice.jpg";
import sharedPlay from "../assets/legacy/shared-play.jpg";
import therapyConversation from "../assets/legacy/therapy-conversation.jpg";
import therapyRoom from "../assets/legacy/therapy-room.jpg";
import therapySwing from "../assets/legacy/therapy-swing.jpg";
import therapyTunnel from "../assets/legacy/therapy-tunnel.jpg";
import toyBlocks from "../assets/legacy/toy-blocks.jpg";

export const heroMedia = {
  home: [climbingPlay, sharedPlay, heroTherapy, ballPit],
  families: [therapyTunnel, familyBallPit, therapyConversation, therapyRoom],
  professionals: [movementSession, therapySwing, therapyRoom, therapyConversation],
  courses: [movementSession, sensoryRice, therapySwing, activePlay],
  certification: [therapyConversation, movementSession, therapyRoom, therapeuticSpace],
  about: [familyBallPit, ballPit, climbingPlay, therapeuticSpace],
  search: [therapyRoom, therapyConversation, climbingPlay, therapeuticSpace],
  contact: [therapyConversation, sharedPlay, therapyRoom, heroTherapy],
  notFound: [toyBlocks, therapeuticSpace, activePlay, heroTherapy],
} satisfies Record<string, ImageMetadata[]>;

export const featureMedia = {
  toyBlocks,
  sensoryRice,
  sharedPlay,
};

export const courseMedia = {
  therapy: heroTherapy,
  space: therapeuticSpace,
  ballPit,
  climbingPlay,
  familyBallPit,
  sharedPlay,
  conversation: therapyConversation,
  room: therapyRoom,
  tunnel: therapyTunnel,
  blocks: toyBlocks,
} satisfies Record<string, ImageMetadata>;
