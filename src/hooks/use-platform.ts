import { useEffect, useState } from 'react';

type Platform = 'ios' | 'android' | 'other';

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>('other');

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPod|iPad/i.test(ua)) setPlatform('ios');
    else if (/Android/i.test(ua)) setPlatform('android');
    else setPlatform('other');
  }, []);

  return platform;
}
