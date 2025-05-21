//src/components/PetThemeRenderer.js
import { useEffect, useState, Suspense } from 'react';

/**
 * presetKey   – slug nhận từ backend  (vd: "pet-card-2")
 * pet         – object chứa thông tin thú cưng (name, imageUrl, …)
 */
export default function PetThemeRenderer({ presetKey, pet }) {
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    let mounted = true;

    // dynamic import theo presetKey
    import(`./theme-presets/${presetKey}`)
      .then((m) => mounted && setComponent(() => m.default))
      .catch(() => mounted && setComponent(() => () => <p>Preset not found</p>));

    return () => (mounted = false);
  }, [presetKey]);

  if (!Component) return null;

  return (
    <Suspense fallback={null}>
      <Component {...pet} />
    </Suspense>
  );
}
