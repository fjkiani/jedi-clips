import { registerRoot, Composition } from 'remotion';
import { ShortClip } from './ShortClip';

/**
 * Remotion root — registers all compositions for Lambda rendering.
 * The ShortClip composition is used for both client-side preview
 * and cloud-side rendering via Remotion Lambda.
 */
const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ShortClip"
        component={ShortClip}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoUrl: '',
          startTime: 0,
          endTime: 10,
          captions: '',
          captionStyle: 'karaoke-white',
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
