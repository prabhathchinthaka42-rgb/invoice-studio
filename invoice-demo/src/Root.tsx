import { Composition } from "remotion";
import { MyComposition } from "./Composition";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="InvoiceDemo"
        component={MyComposition}
        durationInFrames={900} // තත්පර 10ක වීඩියෝ එකක් (තත්පර 30fps)
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};