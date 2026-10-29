import type { CSSProperties } from "react";
import { CHAT_MOTION } from "./motion";

type LogoState = "none" | "idle" | "thinking";

type ChatLogoProps = {
  state?: LogoState;
  size?: number | "fill";
};

export default function ChatLogo({ state = "none", size = 28 }: ChatLogoProps) {
  const style = {
    "--chat-logo-idle-duration": `${CHAT_MOTION.logo.idleDuration}s`,
    "--chat-logo-thinking-duration": `${CHAT_MOTION.logo.thinkingDuration}s`,
    "--chat-logo-rotation-duration": `${CHAT_MOTION.logo.rotationDuration}s`,
    "--chat-logo-reduced-duration": `${CHAT_MOTION.logo.reducedDuration}s`,
    "--chat-logo-ray-delay": `${CHAT_MOTION.logo.rayDelay}s`,
    "--chat-logo-idle-min-scale": CHAT_MOTION.logo.idleMinScale,
    "--chat-logo-thinking-min-scale": CHAT_MOTION.logo.thinkingMinScale,
    "--chat-logo-thinking-max-scale": CHAT_MOTION.logo.thinkingMaxScale,
    "--chat-logo-idle-min-opacity": CHAT_MOTION.logo.idleMinOpacity,
    "--chat-logo-thinking-min-opacity": CHAT_MOTION.logo.thinkingMinOpacity,
    "--chat-logo-reduced-min-opacity": CHAT_MOTION.logo.reducedMinOpacity,
    "--chat-logo-max-opacity": CHAT_MOTION.logo.maxOpacity,
    "--chat-logo-unit-scale": CHAT_MOTION.logo.unitScale,
    "--chat-logo-spin-degrees": `${CHAT_MOTION.logo.spinDegrees}deg`,
    width: size === "fill" ? "100%" : size,
    height: size === "fill" ? "100%" : size,
  } as CSSProperties;

  return (
    <svg
      aria-hidden="true"
      className="chat-logo text-[#eee]"
      viewBox="0 0 48 48"
      style={style}
    >
      <g className={state === "thinking" ? "chat-logo-rotating" : undefined}>
        {CHAT_MOTION.logo.rayLengths.map((length, index) => {
          const jitter =
            CHAT_MOTION.logo.rayJitterDegrees[
              index % CHAT_MOTION.logo.rayJitterDegrees.length
            ];
          return (
            <g
              key={index}
              transform={`rotate(${index * CHAT_MOTION.logo.rayAngleStepDegrees + jitter} 24 24)`}
            >
              <rect
                className={
                  state === "none"
                    ? undefined
                    : `chat-logo-ray chat-logo-ray--${state}`
                }
                x="22.4"
                y={24 - length}
                width="3.2"
                height={length - 0.8}
                rx="1.6"
                fill="currentColor"
                style={{ "--i": index } as CSSProperties}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
