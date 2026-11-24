import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, Flip, SplitText, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin, Draggable, InertiaPlugin, useGSAP);

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, Flip, SplitText, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin, Draggable, useGSAP };
