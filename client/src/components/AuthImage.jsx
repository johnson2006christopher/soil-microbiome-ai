import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

// <img> cannot send the Authorization header, so fetch protected images as blobs.
export default function AuthImage({ src, alt, className, fallback = null }) {
  const [objectUrl, setObjectUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url;
    let cancelled = false;
    setFailed(false);
    axiosClient.get(src, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        url = URL.createObjectURL(res.data);
        setObjectUrl(url);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  if (failed || !objectUrl) return fallback;
  return <img src={objectUrl} alt={alt} className={className} />;
}
